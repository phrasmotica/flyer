import { computed, ref } from "vue"

import type { Phase } from "@/data/Phase"

export const useRounds = (p: Phase | null) => {
    const phase = ref(p)

    const rounds = computed(() => phase.value?.rounds || [])

    const raceTos = computed(() => rounds.value.map(r => ({
        name: r.name,
        raceTo: r.bestOf ? Math.ceil((r.bestOf + 1) / 2) : null,
    })))

    const startedRounds = computed(() => rounds.value.filter(r => r.fixtures.some(f => f.startTime)))

    const currentRound = computed(() => {
        const sortedRounds = [...startedRounds.value].sort((r, s) => {
            const startTime1 = r.fixtures.map(f => f.startTime!).reduce((t1, t2) => Math.min(t1, t2))
            const startTime2 = s.fixtures.map(f => f.startTime!).reduce((t1, t2) => Math.min(t1, t2))
            return startTime1 - startTime2
        })

        return sortedRounds[0] || rounds.value[0]
    })

    const nextRoundToGenerate = computed(() => rounds.value.find(r => !r.isGenerated))

    const readyToGenerateNextRound = computed(() => {
        if (generatedRounds.value.length >= rounds.value.length) {
            return false
        }

        const lastGeneratedRound = generatedRounds.value.at(-1)
        return !!lastGeneratedRound && lastGeneratedRound.fixtures.every(f => f.startTime && f.finishTime)
    })

    // don't want to include the always-generated final round, so
    // use a take-while approach
    const generatedRounds = computed(() => takeWhile([...rounds.value], r => r.isGenerated))

    const generationIsComplete = computed(() => !nextRoundToGenerate.value)

    const getRound = (fixtureId: string) => rounds.value.find(r => r.fixtures.some(f => f.id === fixtureId))

    const takeWhile = <T>(arr: T[], pred: (x: T) => boolean): T[] => {
        if (arr.length <= 0) {
            return []
        }

        return pred(arr[0]) ? [arr[0], ...takeWhile(arr.slice(1, -1), pred)] : []
    }

    return {
        rounds,

        raceTos,
        currentRound,
        nextRoundToGenerate,
        readyToGenerateNextRound,
        generatedRounds,
        generationIsComplete,

        getRound,
    }
}
