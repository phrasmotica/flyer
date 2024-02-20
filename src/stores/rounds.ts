import { computed, ref } from "vue"
import { defineStore } from "pinia"

import type { Round } from "../data/RoundRobinScheduler"

import type { Result } from "../models/Result"

export const useRoundsStore = defineStore("rounds", () => {
    const rounds = ref<Round[]>([])

    const results = computed(() => rounds.value.flatMap(r => r.fixtures))

    const remainingCount = computed(() => rounds.value.flatMap(r => r.fixtures).filter(f => !f.finishTime).length)

    const currentRound = computed(() => {
        const oldestInProgressRound = rounds.value.find(r => r.fixtures.some(f => !f.finishTime))
        if (!oldestInProgressRound) {
            return 0
        }

        return oldestInProgressRound.index
    })

    const getRound = (resultId: string) => rounds.value.find(r => r.fixtures.some(f => f.id === resultId))

    const setRounds = (r: Round[]) => rounds.value = r

    const startFixture = (id: string) => {
        rounds.value = rounds.value.map(r => r.startFixture(id))
    }

    const updateResult = (newResult: Result, finish: boolean) => {
        rounds.value = rounds.value.map(r => r.updateResult(newResult, finish))
    }

    const clear = () => setRounds([])

    return { rounds, results, remainingCount, currentRound, getRound, setRounds, startFixture, updateResult, clear }
})
