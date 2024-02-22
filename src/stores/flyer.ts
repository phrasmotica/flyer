import { computed, ref } from "vue"
import { differenceInMinutes } from "date-fns"
import { defineStore } from "pinia"

import { Flyer } from "../data/Flyer"
import type { Result } from "../data/Result"
import type { Round } from "../data/Round"

export const useFlyerStore = defineStore("flyer", () => {
    const flyer = ref<Flyer>()

    const rounds = computed(() => flyer.value?.rounds ?? [])

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

    const durationMinutes = computed(() => {
        if (!flyer.value?.startTime || !flyer.value?.finishTime) {
            return null
        }

        return differenceInMinutes(new Date(flyer.value.finishTime), (new Date(flyer.value.startTime)))
    })

    const getRound = (resultId: string) => rounds.value.find(r => r.fixtures.some(f => f.id === resultId))

    const start = (r: Round[]) => {
        flyer.value = new Flyer(r)
        flyer.value.start()
    }

    const startFixture = (id: string) => {
        flyer.value?.startFixture(id)
    }

    const updateResult = (newResult: Result, finish: boolean) => {
        flyer.value?.updateResult(newResult, finish)
    }

    const finish = () => {
        flyer.value?.finish()
    }

    const clear = () => flyer.value = undefined

    return {
        rounds,
        results,
        ongoingCount,
        remainingCount,
        currentRound,
        durationMinutes,
        getRound,
        start,
        startFixture,
        updateResult,
        finish,
        clear,
    }
})
