import type { Flyer } from "@/data/Flyer"
import { Format } from "@/data/FlyerSettings"
import type { Result } from "@/data/Result"
import { computed, ref } from "vue"

export const usePodium = (f: Flyer) => {
    const flyer = ref(f)

    const finalists = computed(() => {
        if (f.settings.format === Format.RoundRobin) {
            return <[string, string]>["", ""]
        }

        if (!flyer.value.startTime || !flyer.value.finishTime) {
            return <[string, string]>["", ""]
        }

        const rounds = flyer.value.rounds
        const finalRound = rounds[rounds.length - 1]
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

    const winner = computed(() => flyer.value.players.find(p => p.id === finalists.value[0]))
    const runnerUp = computed(() => flyer.value.players.find(p => p.id === finalists.value[1]))

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
        runnerUp,
    }
}
