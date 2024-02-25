import { ref } from "vue"
import { useIntervalFn } from "@vueuse/core"
import { differenceInSeconds } from "date-fns"
import { v4 as uuidv4 } from "uuid"

export const useClock = (startTime: number) => {
    const computeDifference = () => differenceInSeconds(Date.now(), startTime)

    const elapsedSeconds = ref(computeDifference())

    const guid = uuidv4()

    const updateClock = () => {
        const newValue = computeDifference()
        console.debug("Clock " + guid + ": " + newValue)
        elapsedSeconds.value = newValue
    }

    const interval = useIntervalFn(updateClock, 1000)

    return {
        elapsedSeconds,
        interval,
    }
}
