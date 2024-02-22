import { computed, ref } from "vue"
import { defineStore } from "pinia"

import { Flyer } from "../data/Flyer"
import type { Result } from "../data/Result"
import type { Round } from "../data/Round"

export const useRoundsStore = defineStore("rounds", () => {
    const flyer = ref<Flyer>()

    const rounds = computed(() => flyer.value?.getRounds() ?? [])

    const results = computed(() => rounds.value.flatMap(r => r.fixtures))

    const ongoingCount = computed(() => results.value.filter(f => f.startTime && !f.finishTime).length)
    const remainingCount = computed(() => results.value.filter(f => !f.finishTime).length)

    const currentRound = computed(() => {
        const oldestInProgressRound = rounds.value.find(r => r.fixtures.some(f => !f.finishTime))
        if (!oldestInProgressRound) {
            return 0
        }

        return oldestInProgressRound.index
    })

    const getRound = (resultId: string) => rounds.value.find(r => r.fixtures.some(f => f.id === resultId))

    const setRounds = (r: Round[]) => {
        flyer.value = new Flyer(r)
    }

    const startFixture = (id: string) => {
        flyer.value = flyer.value?.startFixture(id)
    }

    const updateResult = (newResult: Result, finish: boolean) => {
        flyer.value = flyer.value?.updateResult(newResult, finish)
    }

    const clear = () => setRounds([])

    return {
        rounds,
        results,
        ongoingCount,
        remainingCount,
        currentRound,
        getRound,
        setRounds,
        startFixture,
        updateResult,
        clear,
    }
})
