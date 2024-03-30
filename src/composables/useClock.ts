import { ref, watch } from "vue"
import { useIntervalFn } from "@vueuse/core"
import { differenceInMilliseconds } from "date-fns"

import { useEnv } from "./useEnv"

type Clockable = {
    startTime: number | null,
    finishTime: number | null,
}

export const useClock = (name: string, c: Clockable | null) => {
    const clockable = ref(c)

    const {
        isDebug,
    } = useEnv()

    const computeDifference = () => differenceInMilliseconds(Date.now(), clockable.value?.startTime || Date.now())

    const elapsedMilliseconds = ref(computeDifference())

    const updateClock = () => {
        const newValue = computeDifference()

        if (isDebug) {
            console.debug(name + ": " + clockable.value?.startTime + " + " + newValue)
        }

        elapsedMilliseconds.value = newValue
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
        elapsedMilliseconds,
        pauseClock,
        resumeClock,
    }
}
