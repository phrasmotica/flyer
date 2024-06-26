import { computed, ref } from "vue"
import { useArrayFilter, useSorted } from "@vueuse/core"

import type { Phase } from "@/data/Phase"
import { PhaseEventLevel, type PhaseEvent } from "@/data/PhaseEvent"

export const useEventLog = (p: Phase | null) => {
    const phase = ref(p)

    const eventLog = computed(() => phase.value?.eventLog || [])

    const sortPhaseEvents = (e: PhaseEvent, f: PhaseEvent) => {
        // reverse chronological order
        return f.timestamp - e.timestamp
    }

    const defaultEventLog = useArrayFilter(eventLog, e => e.level <= PhaseEventLevel.Default)

    const sortedDefaultEventLog = useSorted(defaultEventLog, sortPhaseEvents)

    return {
        sortedDefaultEventLog,
    }
}
