import { computed, ref } from "vue"

import { type FlyerSettings, TieBreaker } from "../data/FlyerSettings"
import type { Player } from "../data/Player"
import type { Result } from "../data/Result"

export const useStandings = (r: Result[], p: Player[], s: FlyerSettings) => {
    const results = ref(r)
    const players = ref(p)
    const settings = ref(s)

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

    const getPlayed = (player: string) => results.value.filter(r => hasPlayed(r, player)).length

    const getWins = (player: string) => results.value.filter(r => getWinner(r) === player).length

    const getDraws = (player: string) => results.value.filter(r => isDraw(r) && r.scores.some(s => s.playerId === player)).length

    const getLosses = (player: string) => results.value.filter(r => getLoser(r) === player).length

    const getFrameDifference = (playerId: string) => {
        const played = results.value.filter(r => hasPlayed(r, playerId))
        return played.map(r => {
            const playerScore = r.scores.find(s => s.playerId === playerId)!
            const otherScore = r.scores.find(s => s.playerId !== playerId)!

            // assume a two-player match
            return playerScore.score - otherScore.score
        }).reduce((x, y) => x + y, 0)
    }

    const isIncomplete = (player: string) => {
        return results.value.some(r => r.scores.some(s => s.playerId === player) && !r.finishTime)
    }

    const getPlayerScore = (playerId: string, result: Result) => {
        return result.scores.find(s => s.playerId === playerId)
    }

    const getRunouts = (playerId: string) => {
        const played = results.value.filter(r => hasPlayed(r, playerId))
        return played.map(r => getPlayerScore(playerId, r)!.runouts).reduce((x, y) => x + y, 0)
    }

    const sortRecords = (p: PlayerRecord, q: PlayerRecord) => {
        if (p.wins !== q.wins) {
            return q.wins - p.wins
        }

        if (p.losses !== q.losses) {
            return q.losses - p.losses
        }

        if (p.diff !== q.diff) {
            return q.diff - p.diff
        }

        // TODO: give 3 points for a win, 1 for a draw, etc?

        return 0
    }

    const standings = computed(() => {
        const tieBrokenPlayers = <string[]>[]

        const records = players.value.map(p => <PlayerRecord>{
            playerId: p.id,
            name: p.name,
            played: getPlayed(p.id),
            wins: getWins(p.id),
            draws: getDraws(p.id),
            losses: getLosses(p.id),
            diff: getFrameDifference(p.id),
            runouts: getRunouts(p.id),
            incomplete: isIncomplete(p.id),
        })

        const tableData = records
            .sort((p, q) => {
                const firstSort = sortRecords(p, q)
                if (firstSort !== 0) {
                    return firstSort
                }

                if (settings.value.tieBreaker === TieBreaker.HeadToHead) {
                    // TODO: account for multiple head-to-head matches?
                    const match = results.value.find(
                        f => getPlayerScore(p.playerId, f) && getPlayerScore(q.playerId, f)
                    )

                    if (match) {
                        const scoreDiff = getPlayerScore(q.playerId, match)!.score - getPlayerScore(p.playerId, match)!.score
                        if (scoreDiff !== 0) {
                            if (!tieBrokenPlayers.includes(p.playerId)) {
                                tieBrokenPlayers.push(p.playerId)
                            }

                            if (!tieBrokenPlayers.includes(q.playerId)) {
                                tieBrokenPlayers.push(q.playerId)
                            }

                            return scoreDiff
                        }
                    }
                }

                if (settings.value.tieBreaker === TieBreaker.Runouts) {
                    if (p.runouts !== q.runouts) {
                        if (!tieBrokenPlayers.includes(p.playerId)) {
                            tieBrokenPlayers.push(p.playerId)
                        }

                        if (!tieBrokenPlayers.includes(q.playerId)) {
                            tieBrokenPlayers.push(q.playerId)
                        }

                        return q.runouts - p.runouts
                    }
                }

                return 0
            })
            .map((p, i) => ({ rank: i + 1, ...p }))

        return {
            tableData,
            tieBrokenPlayers,
        }
    })

    return {
        results,

        standings,
    }
}

interface PlayerRecord {
    playerId: string
    name: string
    played: number
    wins: number
    draws: number
    losses: number
    diff: number
    runouts: number
    incomplete: boolean
}
