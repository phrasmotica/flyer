import { computed, ref } from "vue"

import { usePlayOffs } from "./usePlayOffs"
import { useStandings } from "./useStandings"

import type { Flyer } from "../data/Flyer"

export const useFlyer = (f: Flyer | null) => {
    const flyer = ref(f)

    const mainPhase = computed(() => flyer.value?.phases[0] || null)

    const playOffPhases = computed(() => flyer.value?.phases.slice(1) || [])

    const {
        processStandings,
    } = usePlayOffs(playOffPhases.value)

    const {
        standings,
        playOffs,
        requiresPlayOff,
        moneyRecipients,
    } = useStandings(mainPhase.value)

    const currentPhase = computed(() => {
        const newestPhases = [...flyer.value?.phases || []].reverse()
        return newestPhases.find(p => p.startTime) || null
    })

    const currentPlayOffPhase = computed(() => {
        const newestPhases = [...playOffPhases.value].reverse()
        return newestPhases.find(p => p.startTime) || null
    })

    const {
        standings: currentPlayOffStandings,
    } = useStandings(currentPlayOffPhase.value)

    const overallStandings = computed(() => {
        if (currentPlayOffPhase.value) {
            return currentPlayOffStandings.value
        }

        return processStandings(standings.value)
    })

    const phaseIsComplete = (id: string) => {
        const phase = flyer.value?.phases.find(p => p.id === id)
        return !!phase?.startTime && !!phase.finishTime
    }

    return {
        flyer,

        playOffPhases,
        mainPhase,
        currentPhase,
        currentPlayOffPhase,

        playOffs,
        requiresPlayOff,
        moneyRecipients,

        overallStandings,

        phaseIsComplete,
    }
}
