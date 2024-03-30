import { ref, watch } from "vue"
import { useIntervalFn } from "@vueuse/core"
import { differenceInSeconds } from "date-fns"

type Clockable = {
    startTime: number | null,
    finishTime: number | null,
}

export const useClock = (name: string, c: Clockable | null) => {
    const clockable = ref(c)

    // HIGH: make this have millisecond precision
    const computeDifference = () => differenceInSeconds(Date.now(), clockable.value?.startTime || Date.now())

    const elapsedSeconds = ref(computeDifference())

    const updateClock = () => {
        const newValue = computeDifference()
        console.debug(name + ": " + clockable.value?.startTime + " + " + newValue)
        elapsedSeconds.value = newValue
    }

    watch(clockable, () => {
        updateClock()

        if (clockable.value?.startTime) {
            clock.resume()
        }
    })

    const clock = useIntervalFn(updateClock, 1000, {
        immediate: false,
    })

    const pauseClock = clock.pause
    const resumeClock = clock.resume

    return {
        clockable,
        elapsedSeconds,
        pauseClock,
        resumeClock,
    }
}
