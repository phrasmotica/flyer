import { computed, ref } from "vue"

import type { Player } from "../data/Player"
import type { Result } from "../data/Result"

export const useStandings = (r: Result[], p: Player[]) => {
    const results = ref(r)
    const players = ref(p)

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

    const tableData = computed(() => {
        const data = players.value.map(p => ({
            name: p.name,
            played: getPlayed(p.id),
            wins: getWins(p.id),
            draws: getDraws(p.id),
            losses: getLosses(p.id),
            diff: getFrameDifference(p.id),
            incomplete: isIncomplete(p.id),
        }))

        return data.sort((p, q) => {
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
        }).map((p, i) => ({ rank: i + 1, ...p }))
    })

    return {
        results,

        tableData,
    }
}
