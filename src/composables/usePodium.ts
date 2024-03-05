import type { Flyer } from "@/data/Flyer"
import type { Result } from "@/data/Result"
import { computed, ref } from "vue"

export const usePodium = (f: Flyer) => {
    const flyer = ref(f)

    const winner = computed(() => {
        if (!flyer.value.startTime || !flyer.value.finishTime) {
            return null
        }

        const rounds = flyer.value.rounds
        const finalRound = rounds[rounds.length - 1]
        if (finalRound) {
            const final = finalRound.fixtures[finalRound.fixtures.length - 1]
            const id = getWinner(final).playerId
            return flyer.value.players.find(p => p.id === id) || null
        }

        return null
    })

    const winnerResults = computed(() => {
        if (!winner.value) {
            return []
        }

        const results = flyer.value.rounds.flatMap(r => r.fixtures)
        const winnerResults = results.filter(r => r.scores.some(s => s.playerId === winner.value!.id))

        // ensures reverse chronological order
        return winnerResults.reverse()
    })

    const getWinner = (f: Result) => f.scores.reduce((s, t) => s.score > t.score ? s : t)

    return {
        winner,
        winnerResults,
    }
}
