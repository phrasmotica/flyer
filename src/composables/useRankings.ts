import { type FlyerSettings, TieBreaker, Format } from "../data/FlyerSettings"
import type { Player } from "../data/Player"
import type { PlayerRecord } from "../data/PlayerRecord"
import type { PlayOff } from "../data/PlayOff"
import type { Result } from "../data/Result"

export const useRankings = () => {
    const hasPlayed = (r: Result, playerId: string) => {
        if (!r.startTime || !r.finishTime) {
            return false
        }

        return r.scores.some(s => s.playerId === playerId)
    }

    const getWinner = (r: Result) => {
        if (!r.finishTime || isDraw(r)) {
            return null
        }

        const maxScore = r.scores.reduce((s, t) => s.score > t.score ? s : t)
        return maxScore.playerId
    }

    const isDraw = (r: Result) => {
        if (!r.finishTime) {
            return false
        }

        const maxScore = r.scores.map(s => s.score).reduce((x, y) => Math.max(x, y))
        return r.scores.every(s => s.score === maxScore)
    }

    const getLoser = (r: Result) => {
        if (!r.finishTime || isDraw(r)) {
            return null
        }

        const minScore = r.scores.reduce((s, t) => s.score < t.score ? s : t)
        return minScore.playerId
    }

    const getPlayed = (results: Result[], player: string) => results.filter(r => hasPlayed(r, player)).length

    const getWins = (results: Result[], player: string) => results.filter(r => getWinner(r) === player).length

    const getDraws = (results: Result[], player: string) => results.filter(r => isDraw(r) && r.scores.some(s => s.playerId === player)).length

    const getLosses = (results: Result[], player: string) => results.filter(r => getLoser(r) === player).length

    const getFrameDifference = (results: Result[], playerId: string) => {
        const played = results.filter(r => hasPlayed(r, playerId))
        return played.map(r => {
            const playerScore = r.scores.find(s => s.playerId === playerId)!
            const otherScore = r.scores.find(s => s.playerId !== playerId)!

            // assume a two-player match
            return playerScore.score - otherScore.score
        }).reduce((x, y) => x + y, 0)
    }

    const isIncomplete = (results: Result[], player: string) => {
        return results.some(r => r.scores.some(s => s.playerId === player) && !r.finishTime)
    }

    const getPlayerScore = (playerId: string, result: Result) => {
        return result.scores.find(s => s.playerId === playerId)
    }

    const getRunouts = (results: Result[], playerId: string) => {
        const played = results.filter(r => hasPlayed(r, playerId))
        return played.map(r => getPlayerScore(playerId, r)!.runouts).reduce((x, y) => x + y, 0)
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

        // TODO: give 3 points for a win, 1 for a draw, etc?

        return 0
    }

    const computeStandings = (results: Result[], players: Player[], settings: FlyerSettings) => {
        const records = players.map(p => <PlayerRecord>{
            playerId: p.id,
            name: p.name,
            played: getPlayed(results, p.id),
            wins: getWins(results, p.id),
            draws: getDraws(results, p.id),
            losses: getLosses(results, p.id),
            diff: getFrameDifference(results, p.id),
            runouts: getRunouts(results, p.id),
            incomplete: isIncomplete(results, p.id),
            rank: 0,
        })

        const tableData = records
            .sort((p, q) => {
                const firstSort = sortRecords(p, q)
                if (firstSort !== 0) {
                    return firstSort
                }

                if (settings.tieBreaker === TieBreaker.HeadToHead) {
                    // TODO: account for multiple head-to-head matches?
                    const match = results.find(
                        f => getPlayerScore(p.playerId, f) && getPlayerScore(q.playerId, f)
                    )

                    if (match) {
                        const scoreDiff = getPlayerScore(q.playerId, match)!.score - getPlayerScore(p.playerId, match)!.score
                        if (scoreDiff !== 0) {
                            return scoreDiff
                        }
                    }
                }

                if (settings.tieBreaker === TieBreaker.Runouts) {
                    if (p.runouts !== q.runouts) {
                        return q.runouts - p.runouts
                    }
                }

                return 0
            })
            .map((p, i) => <PlayerRecord>{ ...p, rank: i + 1 })

        return tableData
    }

    const recordsAreEqual = (r: PlayerRecord, s: PlayerRecord) => {
        return r.wins === s.wins && r.losses === s.losses && r.diff === s.diff
    }

    const computePlayOffs = (results: Result[], players: Player[], settings: FlyerSettings) => {
        if (settings.format === Format.Knockout) {
            return []
        }

        const playOffs = <PlayOff[]>[]

        const standings = computeStandings(results, players, settings)

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
        computeStandings,
        computePlayOffs,
    }
}
