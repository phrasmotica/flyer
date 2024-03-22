import { computed, ref } from "vue"
import { differenceInSeconds } from "date-fns"

import { usePhase } from "./usePhase"
import { usePlayOffs } from "./usePlayOffs"
import { useSettings } from "./useSettings"
import { useStandings } from "./useStandings"

import type { Flyer } from "../data/Flyer"

export const useFlyer = (f: Flyer | null) => {
    const flyer = ref(f)

    const mainPhase = computed(() => flyer.value?.phases[0] || null)

    const playOffPhases = computed(() => flyer.value?.phases.slice(1) || [])

    const {
        settings,
    } = usePhase(mainPhase.value)

    const {
        costPerHour,
    } = useSettings(settings.value)

    const {
        completedPlayOffs,
        getPlayOffRank,
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

    const totalDurationSeconds = computed(() => {
        if (!mainPhase.value?.startTime) {
            return 0
        }

        return differenceInSeconds(mainPhase.value.finishTime || Date.now(), mainPhase.value.startTime)
    })

    const totalCost = computed(() => {
        const durationHours = totalDurationSeconds.value / 3600
        return costPerHour.value * durationHours
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
        completedPlayOffs,
        moneyRecipients,

        overallStandings,
        totalCost,

        getPlayOffRank,
        phaseIsComplete,
    }
}
