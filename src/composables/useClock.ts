import { computed, ref, watch } from "vue"
import { useIntervalFn } from "@vueuse/core"
import { differenceInSeconds } from "date-fns"

import type { Result } from "../data/Result"

export const useMatchClock = (name: string, f: Result) => {
    const result = ref(f)
    const startTime = computed(() => result.value.startTime)

    const computeDifference = () => differenceInSeconds(Date.now(), startTime.value || Date.now())

    const elapsedSeconds = ref(computeDifference())

    const updateClock = () => {
        const newValue = computeDifference()
        console.debug("MatchClock " + name + ": " + startTime.value + " + " + newValue)
        elapsedSeconds.value = newValue
    }

    watch(result, () => {
        updateClock()

        if (result.value.startTime) {
            clock.resume()
        }
    })

    const clock = useIntervalFn(updateClock, 1000, {
        immediate: false,
    })

    return {
        result,
        elapsedSeconds,
        clock,
    }
}

export const useClock = (name: string, initialStartTime: number | null, startNow: boolean) => {
    const startTime = ref(initialStartTime)

    const computeDifference = () => differenceInSeconds(Date.now(), startTime.value || Date.now())

    const elapsedSeconds = ref(computeDifference())

    const updateClock = () => {
        const newValue = computeDifference()
        console.debug("Clock " + name + ": " + startTime.value + " + " + newValue)
        elapsedSeconds.value = newValue
    }

    watch(startTime, updateClock)

    const interval = useIntervalFn(updateClock, 1000, {
        immediate: startNow,
    })

    return {
        startTime,
        elapsedSeconds,
        interval,
    }
}
