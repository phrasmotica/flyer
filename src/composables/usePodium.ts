import { computed } from "vue"

import { useFlyer } from "./useFlyer"
import { useSettings } from "./useSettings"

import type { Flyer } from "../data/Flyer"
import type { Result } from "../data/Result"

// LOW: ideally this would not have to accept null, but useFlyer() currently
// accepts null (see ResultsTable.vue)
export const usePodium = (f: Flyer | null) => {
    const {
        flyer,
        results,
        players,
        settings,
        rounds,
    } = useFlyer(f)

    const {
        isRoundRobin,
    } = useSettings(settings.value)

    const finalists = computed<[string, string]>(() => {
        if (!flyer.value) {
            return ["", ""]
        }

        if (!flyer.value.startTime || !flyer.value.finishTime) {
            return ["", ""]
        }

        if (isRoundRobin.value) {
            return ["", ""]
        }

        const finalRound = rounds.value[rounds.value.length - 1]
        if (!finalRound) {
            return ["", ""]
        }

        const final = finalRound.fixtures[finalRound.fixtures.length - 1]
        const winnerId = getWinner(final).playerId

        return [
            winnerId,
            final.scores.filter(s => s.playerId !== winnerId)[0].playerId
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
