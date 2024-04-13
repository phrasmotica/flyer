import { computed } from "vue"
import { useSorted } from "@vueuse/core"

import { useFixtureList } from "./useFixtureList"
import { usePhase } from "./usePhase"
import { usePhaseSettings } from "./usePhaseSettings"
import { useRankings } from "./useRankings"

import type { Phase } from "@/data/Phase"

export const useStandings = (p: Phase | null) => {
    const {
        phase,
        players,
        settings,
    } = usePhase(p)

    const {
        fixtures,
    } = useFixtureList(phase.value)

    const {
        isKnockout,
        isRoundRobin,
        usesPlayOff,
    } = usePhaseSettings(settings.value)

    const {
        computeStandings,
        computePlayOffs,
    } = useRankings()

    const standings = computed(() => computeStandings(fixtures.value, players.value, settings.value))

    const playOffs = computed(() => computePlayOffs(fixtures.value, players.value, settings.value))

    const orderedPlayOffs = useSorted(playOffs, (a, b) => b.forRank - a.forRank)

    const requiresPlayOff = computed(() => {
        return usesPlayOff.value
            && isRoundRobin.value
            && orderedPlayOffs.value.length > 0
    })

    const firstPlace = computed(() => {
        if (isKnockout.value) {
            return null
        }

        const standings = computeStandings(fixtures.value, players.value, settings.value)
        return players.value.find(p => p.id === standings[0].playerId)!
    })

    return {
        standings,
        playOffs,
        orderedPlayOffs,
        requiresPlayOff,
        firstPlace,
    }
}
