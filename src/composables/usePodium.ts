import { computed } from "vue"

import { useFlyer } from "./useFlyer"

import type { Flyer } from "../data/Flyer"
import { Format } from "../data/FlyerSettings"
import type { Result } from "../data/Result"

// TODO: ideally this would not have to accept null, but useFlyer() currently
// accepts null (see TODO in ResultsTable.vue)
export const usePodium = (f: Flyer | null) => {
    const {
        flyer,
        results,
        players,
        settings,
        rounds,
    } = useFlyer(f)

    const finalists = computed(() => {
        if (!flyer.value) {
            return <[string, string]>["", ""]
        }

        if (!flyer.value.startTime || !flyer.value.finishTime) {
            return <[string, string]>["", ""]
        }

        if (settings.value.format === Format.RoundRobin) {
            return <[string, string]>["", ""]
        }

        const finalRound = rounds.value[rounds.value.length - 1]
        if (!finalRound) {
            return <[string, string]>["", ""]
        }

        const final = finalRound.fixtures[finalRound.fixtures.length - 1]
        const winnerId = getWinner(final).playerId

        return <[string, string]>[
            winnerId,
            ...final.scores.filter(s => s.playerId !== winnerId).map(s => s.playerId)
        ]
    })

    const winner = computed(() => players.value.find(p => p.id === finalists.value[0]))
    const runnerUp = computed(() => players.value.find(p => p.id === finalists.value[1]))

    const winnerResults = computed(() => {
        if (!winner.value) {
            return []
        }

        const winnerResults = results.value.filter(r => r.scores.some(s => s.playerId === winner.value!.id))

        // ensures reverse chronological order
        return winnerResults.reverse()
    })

    const getWinner = (f: Result) => f.scores.reduce((s, t) => s.score > t.score ? s : t)

    return {
        winner,
        winnerResults,
        runnerUp,
    }
}
