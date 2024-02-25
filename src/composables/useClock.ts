import { ref } from "vue"
import { useIntervalFn } from "@vueuse/core"
import { differenceInSeconds } from "date-fns"

export const useClock = (name: string, startTime: number) => {
    const computeDifference = () => differenceInSeconds(Date.now(), startTime)

    const elapsedSeconds = ref(computeDifference())

    const updateClock = () => {
        const newValue = computeDifference()
        console.debug("Clock " + name + ": " + newValue)
        elapsedSeconds.value = newValue
    }

    const interval = useIntervalFn(updateClock, 1000)

    return {
        elapsedSeconds,
        interval,
    }
}
