import { computed, ref } from "vue"
import { useArrayFilter } from "@vueuse/core"

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
        tieBreakers,
        unresolvedTieBreakers,
    } = useStandings(mainPhase.value)

    const currentPhase = computed(() => {
        const newestPhases = [...flyer.value?.phases || []].reverse()
        return newestPhases.find(p => p.startTime) || null
    })

    const currentPlayOffPhase = computed(() => {
        const newestPhases = [...playOffPhases.value].reverse()
        return newestPhases.find(p => p.startTime) || null
    })

    const nextUnresolvedTieBreaker = computed(() => {
        const remaining = unresolvedTieBreakers.value.filter(p => !phaseIsComplete(p.id))
        return remaining.length > 0 ? remaining[0] : null
    })

    const unplayedTieBreakers = useArrayFilter(
        tieBreakers,
        t => !phaseIsComplete(t.id))

    // tie-breakers where some players might have been drafted into a play-off,
    // but where there are also still enough players to break ties between
    const stillRelevantTieBreakers = useArrayFilter(
        unplayedTieBreakers,
        t => t.players.filter(p => !hasAlreadyPlayedOff(p.id)).length > 1)

    const allPlayOffsComplete = computed(() => {
        return completedPlayOffs.value.length >= unresolvedTieBreakers.value.length
    })

    const overallStandings = computed(() => processStandings(standings.value))

    const inseparablePlayers = computed(() => {
        const recordsToConsider = standings.value.filter(s => {
            return !s.tieBroken && !hasAlreadyPlayedOff(s.playerId)
        })

        const playerIds = recordsToConsider.map(s => s.playerId)

        const tieBreakersToConsider = tieBreakers.value.filter(p => !phaseIsComplete(p.id))
        const playersIdsInTieBreakers = tieBreakersToConsider.flatMap(p => p.players).map(p => p.id)

        return playerIds.filter(x => playersIdsInTieBreakers.includes(x))
    })

    const playersAlreadyPlayedOff = computed(() => completedPlayOffs.value
        .flatMap(p => p.players)
        .map(x => x.id))

    const hasAlreadyPlayedOff = (playerId: string) => {
        return playersAlreadyPlayedOff.value.includes(playerId)
    }

    const overallMoneyRecipients = computed(() => getMoneyRecipients(standings.value))

    const incompleteCount = computed(() => overallStandings.value.filter(d => d.incomplete).length)

    const isComplete = computed(() => allPlayOffsComplete.value && inseparablePlayers.value.length <= 0)

    const isFinished = computed(() => !!flyer.value?.finishTime)

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

        tieBreakers,
        unplayedTieBreakers,
        stillRelevantTieBreakers,
        nextUnresolvedTieBreaker,
        completedPlayOffs,

        overallStandings,
        inseparablePlayers,
        overallMoneyRecipients,
        incompleteCount,
        isComplete,
        isFinished,

        hasAlreadyPlayedOff,
        phaseIsComplete,
    }
}
