import { computed, ref, watch } from "vue"
import { useIntervalFn } from "@vueuse/core"
import { differenceInSeconds } from "date-fns"

import type { Flyer } from "../data/Flyer"

export const useFlyer = (f: Flyer) => {
    const flyer = ref(f)

    const hasStarted = computed(() => !!flyer.value.startTime)
    const hasFinished = computed(() => !!flyer.value.finishTime)
    const isInProgress = computed(() => hasStarted.value && !hasFinished.value)
    const isComplete = computed(() => {
        return flyer.value.rounds.flatMap(r => r.fixtures).every(x => x.startTime && x.finishTime)
    })

    const durationSeconds = computed(() => {
        if (!hasStarted.value || !hasFinished.value) {
            return null
        }

        return Math.floor((flyer.value.finishTime! - flyer.value.startTime!) / 1000)
    })

    const computeDifference = () => differenceInSeconds(Date.now(), flyer.value.startTime || Date.now())

    const elapsedSeconds = ref(computeDifference())

    const updateClock = () => {
        const newValue = computeDifference()
        console.debug("FlyerClock " + flyer.value.settings.name + ": " + flyer.value.startTime + " + " + newValue)
        elapsedSeconds.value = newValue
    }

    watch(flyer, () => {
        updateClock()

        if (flyer.value.startTime) {
            resumeClock()
        }
    })

    const clock = useIntervalFn(updateClock, 1000, {
        immediate: false,
    })

    const pauseClock = clock.pause
    const resumeClock = clock.resume

    return {
        flyer,

        elapsedSeconds,
        hasStarted,
        hasFinished,
        isInProgress,
        isComplete,
        durationSeconds,

        pauseClock,
        resumeClock,
    }
}
