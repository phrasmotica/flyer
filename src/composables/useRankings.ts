import type { Fixture } from "../data/Fixture"
import { type FlyerSettings, TieBreaker, Format } from "../data/FlyerSettings"
import type { Player } from "../data/Player"
import type { PlayerRecord } from "../data/PlayerRecord"
import type { PlayOff } from "../data/PlayOff"

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
        if (p.wins !== q.wins) {
            return q.wins - p.wins
        }

        if (p.losses !== q.losses) {
            // fewer losses is better
            return p.losses - q.losses
        }

        if (p.diff !== q.diff) {
            return q.diff - p.diff
        }

        // LOW: give 3 points for a win, 1 for a draw, etc?

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

    const computeStandings = (fixtures: Fixture[], players: Player[], settings: FlyerSettings) => {
        const records = players.map<PlayerRecord>(p => ({
            playerId: p.id,
            name: p.name,
            played: getPlayed(fixtures, p.id),
            wins: getWins(fixtures, p.id),
            draws: getDraws(fixtures, p.id),
            losses: getLosses(fixtures, p.id),
            diff: getFrameDifference(fixtures, p.id),
            runouts: getRunouts(fixtures, p.id),
            incomplete: isIncomplete(fixtures, p.id),
            rank: 0,
        }))

        const tableData = records
            .sort((p, q) => {
                const firstSort = sortRecords(p, q)
                if (firstSort !== 0) {
                    return firstSort
                }

                if (settings.tieBreaker === TieBreaker.HeadToHead) {
                    const scoreDiff = sortHeadToHead(p, q, fixtures)
                    if (scoreDiff !== 0) {
                        return scoreDiff
                    }
                }

                if (settings.tieBreaker === TieBreaker.Runouts) {
                    if (p.runouts !== q.runouts) {
                        return q.runouts - p.runouts
                    }
                }

                return 0
            })
            .map<PlayerRecord>((p, i) => ({ ...p, rank: i + 1 }))

        return tableData
    }

    const recordsAreEqual = (r: PlayerRecord, s: PlayerRecord) => {
        return r.wins === s.wins && r.losses === s.losses && r.diff === s.diff
    }

    const computePlayOffs = (fixtures: Fixture[], players: Player[], settings: FlyerSettings) => {
        if (settings.format === Format.Knockout) {
            return []
        }

        const playOffs = <PlayOff[]>[]

        const standings = computeStandings(fixtures, players, settings)

        for (const record of standings) {
            const player = players.find(p => p.id === record.playerId)!
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
        computePlayOffs,
    }
}
