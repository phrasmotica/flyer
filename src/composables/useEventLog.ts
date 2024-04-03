import { computed, ref } from "vue"
import { useSorted } from "@vueuse/core"

import type { Phase, PhaseEvent } from "../data/Phase"

export const useEventLog = (p: Phase | null) => {
    const phase = ref(p)

    const eventLog = computed(() => phase.value?.eventLog || [])

    const sortPhaseEvents = (e: PhaseEvent, f: PhaseEvent) => {
        // reverse chronological order
        return f.timestamp - e.timestamp
    }

    const sortedEventLog = useSorted(eventLog, sortPhaseEvents)

    return {
        sortedEventLog,
    }
}
