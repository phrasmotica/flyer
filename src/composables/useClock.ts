import { ref, watch } from "vue"
import { useIntervalFn } from "@vueuse/core"
import { differenceInSeconds } from "date-fns"

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
