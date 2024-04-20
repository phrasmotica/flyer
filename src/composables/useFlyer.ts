import { computed, ref } from "vue"

import { usePlayOffs } from "./usePlayOffs"
import { useStandings } from "./useStandings"

import type { Flyer } from "@/data/Flyer"

export const useFlyer = (f: Flyer | null) => {
    const flyer = ref(f)

    const mainPhase = computed(() => flyer.value?.phases[0] || null)

    const playOffPhases = computed(() => flyer.value?.phases.slice(1) || [])

    const {
        completedPlayOffs,
        processStandings,
        getMoneyRecipients,
    } = usePlayOffs(flyer.value)

    const {
        standings,
        playOffs,
        unresolvedPlayOffs,
        requiresPlayOff,
    } = useStandings(mainPhase.value)

    const currentPhase = computed(() => {
        const newestPhases = [...flyer.value?.phases || []].reverse()
        return newestPhases.find(p => p.startTime) || null
    })

    const currentPlayOffPhase = computed(() => {
        const newestPhases = [...playOffPhases.value].reverse()
        return newestPhases.find(p => p.startTime) || null
    })

    const allPlayOffsComplete = computed(() => {
        return completedPlayOffs.value.length >= unresolvedPlayOffs.value.length
    })

    const overallStandings = computed(() => processStandings(standings.value))

    const inseparablePlayers = computed(() => {
        const recordsToConsider = standings.value.filter(s => !s.tieBroken)
        const playerIds = recordsToConsider.map(s => s.playerId)

        const playOffsToConsider = playOffs.value.filter(p => !phaseIsComplete(p.id))
        const playersIdsInPlayOffs = playOffsToConsider.flatMap(p => p.players).map(p => p.id)

        return playerIds.filter(x => playersIdsInPlayOffs.includes(x))
    })

    const overallMoneyRecipients = computed(() => getMoneyRecipients(standings.value))

    const incompleteCount = computed(() => overallStandings.value.filter(d => d.incomplete).length)

    const isComplete = computed(() => !requiresPlayOff.value && allPlayOffsComplete.value && inseparablePlayers.value.length <= 0)

    const phaseIsComplete = (id: string) => {
        const phase = flyer.value?.phases.find(p => p.id === id)
        if (!phase) {
            return false
        }

        return !!phase.skippedTime || (!!phase.startTime && !!phase.finishTime)
    }

    return {
        flyer,

        playOffPhases,
        mainPhase,
        currentPhase,
        currentPlayOffPhase,
        allPlayOffsComplete,

        playOffs,
        requiresPlayOff,
        completedPlayOffs,

        overallStandings,
        inseparablePlayers,
        overallMoneyRecipients,
        incompleteCount,
        isComplete,

        phaseIsComplete,
    }
}
