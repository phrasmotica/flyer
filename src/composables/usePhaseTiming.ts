import { computed, ref } from "vue"
import { differenceInMilliseconds, differenceInMinutes } from "date-fns"

import { usePhaseSettings } from "./usePhaseSettings"
import { useScheduler } from "./useScheduler"

import type { Phase } from "@/data/Phase"

export const usePhaseTiming = (p: Phase | null) => {
    const phase = ref(p)

    const {
        settings,
    } = usePhaseSettings(phase.value)

    const {
        scheduler,
    } = useScheduler(settings.value)

    const hasStarted = computed(() => !!phase.value?.startTime)
    const hasFinished = computed(() => !!phase.value?.finishTime)
    const isInProgress = computed(() => hasStarted.value && !hasFinished.value)

    const estimatedDurationMinutes = computed(() => {
        if (!phase.value) {
            return 0
        }

        return scheduler.value.estimateDurationForPhase(phase.value)
    })

    const durationMinutes = computed(() => {
        if (!phase.value?.startTime || !phase.value.finishTime) {
            return null
        }

        return differenceInMinutes(phase.value.finishTime, phase.value.startTime)
    })

    const durationMilliseconds = computed(() => {
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
        durationMinutes,
        durationMilliseconds,
    }
}
