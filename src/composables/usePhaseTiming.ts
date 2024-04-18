import { computed, ref, watch } from "vue"
import { differenceInMilliseconds, differenceInMinutes } from "date-fns"

import { useClock } from "./useClock"
import { usePhaseSettings } from "./usePhaseSettings"
import { useScheduler } from "./useScheduler"

import type { Phase } from "@/data/Phase"

export const usePhaseTiming = (p: Phase | null) => {
    const phase = ref(p)

    const {
        settings,
    } = usePhaseSettings(phase.value)

    const {
        clockable,
        elapsedMilliseconds,
        pauseClock,
        resumeClock,
    } = useClock("PhaseClock " + settings.value.name, phase.value)

    const {
        scheduler,
    } = useScheduler(settings.value)

    watch(phase, () => {
        clockable.value = phase.value
    })

    const wasSkipped = computed(() => !!phase.value?.skippedTime)

    const hasStarted = computed(() => !wasSkipped.value && !!phase.value?.startTime)
    const hasFinished = computed(() => wasSkipped.value || !!phase.value?.finishTime)
    const isInProgress = computed(() => hasStarted.value && !hasFinished.value)

    const estimatedDurationMinutes = computed(() => {
        if (!phase.value) {
            return 0
        }

        return scheduler.value.estimateDurationForPhase(phase.value)
    })

    const clockDisplay = computed(() => {
        return durationMilliseconds.value || elapsedMilliseconds.value
    })

    const durationMinutes = computed(() => {
        if (wasSkipped.value) {
            return null
        }

        if (!phase.value?.startTime || !phase.value.finishTime) {
            return null
        }

        return differenceInMinutes(phase.value.finishTime, phase.value.startTime)
    })

    const durationMilliseconds = computed(() => {
        if (wasSkipped.value) {
            return null
        }

        if (!phase.value?.startTime || !phase.value.finishTime) {
            return null
        }

        return differenceInMilliseconds(phase.value.finishTime, phase.value.startTime)
    })

    return {
        hasStarted,
        hasFinished,
        isInProgress,

        estimatedDurationMinutes,

        elapsedMilliseconds,
        clockDisplay,

        durationMinutes,
        durationMilliseconds,

        pauseClock,
        resumeClock,
    }
}
