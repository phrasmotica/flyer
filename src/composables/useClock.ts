import { ref } from "vue"
import { useIntervalFn } from "@vueuse/core"
import { differenceInSeconds } from "date-fns"

export const useClock = (name: string, startTime: number | null, startNow: boolean) => {
    const computeDifference = () => differenceInSeconds(Date.now(), startTime || Date.now())

    const elapsedSeconds = ref(computeDifference())

    const updateClock = () => {
        const newValue = computeDifference()
        console.debug("Clock " + name + ": " + startTime + " + " + newValue)
        elapsedSeconds.value = newValue
    }

    const interval = useIntervalFn(updateClock, 1000, {
        immediate: startNow,
    })

    return {
        elapsedSeconds,
        interval,
    }
}
