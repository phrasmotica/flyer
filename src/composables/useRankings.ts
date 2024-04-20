import type { Fixture } from "@/data/Fixture"
import type { Phase } from "@/data/Phase"
import { TieBreaker, Format, type PhaseSettings } from "@/data/PhaseSettings"
import type { Player } from "@/data/Player"
import type { PlayerRecord } from "@/data/PlayerRecord"
import type { PlayOff } from "@/data/PlayOff"

const POINTS_PER_WIN = 3
const POINTS_PER_DRAW = 1
const POINTS_PER_LOSS = 0

export const useRankings = () => {
    const hasPlayed = (f: Fixture, playerId: string) => {
        if (!f.startTime || !f.finishTime) {
            return false
        }

        return f.scores.some(s => s.playerId === playerId)
    }

    const getWinner = (f: Fixture) => {
        if (!f.finishTime || isDraw(f)) {
            return null
        }

        const maxScore = f.scores.reduce((s, t) => s.score > t.score ? s : t)
        return maxScore.playerId
    }

    const isDraw = (f: Fixture) => {
        if (!f.finishTime) {
            return false
        }

        const maxScore = f.scores.map(s => s.score).reduce((x, y) => Math.max(x, y))
        return f.scores.every(s => s.score === maxScore)
    }

    const getLoser = (f: Fixture) => {
        if (!f.finishTime || isDraw(f)) {
            return null
        }

        const minScore = f.scores.reduce((s, t) => s.score < t.score ? s : t)
        return minScore.playerId
    }

    const getPlayed = (fixtures: Fixture[], player: string) => fixtures.filter(f => hasPlayed(f, player)).length

    const getWins = (fixtures: Fixture[], player: string) => fixtures.filter(f => getWinner(f) === player).length

    const getDraws = (fixtures: Fixture[], player: string) => fixtures.filter(f => isDraw(f) && f.scores.some(s => s.playerId === player)).length

    const getLosses = (fixtures: Fixture[], player: string) => fixtures.filter(f => getLoser(f) === player).length

    const getFrameDifference = (fixtures: Fixture[], playerId: string) => {
        const played = fixtures.filter(f => hasPlayed(f, playerId))
        return played.map(f => {
            const playerScore = f.scores.find(s => s.playerId === playerId)!
            const otherScore = f.scores.find(s => s.playerId !== playerId)!

            // assume a two-player match
            return playerScore.score - otherScore.score
        }).reduce((x, y) => x + y, 0)
    }

    const getPoints = (fixtures: Fixture[], player: string) => {
        return POINTS_PER_WIN * getWins(fixtures, player)
            + POINTS_PER_DRAW * getDraws(fixtures, player)
            + POINTS_PER_LOSS * getLosses(fixtures, player)
    }

    const isIncomplete = (fixtures: Fixture[], player: string) => {
        return fixtures.some(f => f.scores.some(s => s.playerId === player) && !f.finishTime)
    }

    const getPlayerScore = (playerId: string, fixture: Fixture) => {
        return fixture.scores.find(s => s.playerId === playerId)
    }

    const getRunouts = (fixtures: Fixture[], playerId: string) => {
        const played = fixtures.filter(f => hasPlayed(f, playerId))
        return played.map(f => getPlayerScore(playerId, f)!.runouts).reduce((x, y) => x + y, 0)
    }

    const sortRecords = (p: PlayerRecord, q: PlayerRecord) => {
        if (p.points !== q.points) {
            return q.points - p.points
        }

        if (p.diff !== q.diff) {
            return q.diff - p.diff
        }

        if (p.wins !== q.wins) {
            return q.wins - p.wins
        }

        return 0
    }

    const sortHeadToHead = (p: PlayerRecord, q: PlayerRecord, fixtures: Fixture[]) => {
        const relevantFixtures = fixtures.filter(
            f => getPlayerScore(p.playerId, f) && getPlayerScore(q.playerId, f)
        )

        if (relevantFixtures.length > 0) {
            const scoreDiffs = relevantFixtures.map(m => getPlayerScore(q.playerId, m)!.score - getPlayerScore(p.playerId, m)!.score)
            return scoreDiffs.reduce((a, b) => a + b) // overall frame difference
        }

        return 0
    }

    const computeStandings = (phase: Phase | null, considerDefaultRanking: boolean) => {
        if (!phase) {
            return []
        }

        if (considerDefaultRanking && phase.ranking.length > 0) {
            return phase.ranking
        }

        const fixtures = phase.rounds.flatMap(r => r.fixtures)

        const records = phase.players.map<PlayerRecord>(p => ({
            playerId: p.id,
            name: p.name,
            played: getPlayed(fixtures, p.id),
            wins: getWins(fixtures, p.id),
            draws: getDraws(fixtures, p.id),
            losses: getLosses(fixtures, p.id),
            diff: getFrameDifference(fixtures, p.id),
            runouts: getRunouts(fixtures, p.id),
            points: getPoints(fixtures, p.id),
            incomplete: isIncomplete(fixtures, p.id),
            rank: 0,
            tieBroken: false,
        }))

        const tableData = records
            .sort((p, q) => {
                const firstSort = sortRecords(p, q)
                if (firstSort !== 0) {
                    return firstSort
                }

                if (phase.settings.tieBreaker === TieBreaker.HeadToHead) {
                    const scoreDiff = sortHeadToHead(p, q, fixtures)
                    if (scoreDiff !== 0) {
                        p.tieBroken = true
                        q.tieBroken = true

                        return scoreDiff
                    }

                    // HIGH: what if the players drew against each other overall??
                }

                if (phase.settings.tieBreaker === TieBreaker.Runouts) {
                    if (p.runouts !== q.runouts) {
                        p.tieBroken = true
                        q.tieBroken = true

                        return q.runouts - p.runouts
                    }
                }

                return 0
            })
            .map<PlayerRecord>((p, i) => ({ ...p, rank: i + 1 }))

        return tableData
    }

    const computeDummyStandings = (players: Player[]) => {
        return players.map<PlayerRecord>((p, i) => ({
            playerId: p.id,
            name: p.name,
            played: 0,
            wins: 0,
            draws: 0,
            losses: 0,
            diff: 0,
            runouts: 0,
            points: 0,
            incomplete: false,
            rank: i + 1,
            tieBroken: false,
        }))
    }

    const recordsAreEqual = (r: PlayerRecord, s: PlayerRecord) => {
        return r.wins === s.wins && r.losses === s.losses && r.diff === s.diff
    }

    const computePlayOffs = (phase: Phase | null) => {
        if (!phase) {
            return []
        }

        if (phase.settings.format === Format.Knockout) {
            return []
        }

        const playOffs = <PlayOff[]>[]

        const standings = computeStandings(phase, false)

        for (const record of standings) {
            const player = phase.players.find(p => p.id === record.playerId)!
            const matchingPlayOff = playOffs.find(p => recordsAreEqual(record, p.records[0]))

            if (matchingPlayOff) {
                matchingPlayOff.players.push(player)
            }
            else {
                playOffs.push({
                    id: "play-off-" + playOffs.length,
                    name: "Play-Off for Position " + record.rank,
                    forRank: record.rank,
                    records: [record],
                    players: [player],
                })
            }
        }

        return playOffs.filter(p => p.players.length > 1)
    }

    return {
        getWinner,
        getLoser,
        computeStandings,
        computeDummyStandings,
        computePlayOffs,
    }
}
