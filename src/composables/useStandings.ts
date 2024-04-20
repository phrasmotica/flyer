import { computed } from "vue"
import { useArrayFilter, useSorted } from "@vueuse/core"
import { v4 as uuidv4 } from "uuid"

import { useFixtureList } from "./useFixtureList"
import { usePhase } from "./usePhase"
import { usePhaseSettings } from "./usePhaseSettings"
import { usePlayers } from "./usePlayers"
import { useRankings } from "./useRankings"

import type { Phase } from "@/data/Phase"
import type { PlayOff } from "@/data/PlayOff"
import type { PlayerRecord } from "@/data/PlayerRecord"

export const useStandings = (p: Phase | null) => {
    const {
        phase,
    } = usePhase(p)

    const {
        players,
    } = usePlayers(phase.value)

    const {
        isKnockout,
        isRoundRobin,
        usesPlayOff,
    } = usePhaseSettings(phase.value)

    const {
        isStarted,
    } = useFixtureList(phase.value)

    const {
        computeStandings,
        computePlayOffs,
    } = useRankings()

    const standings = computed(() => computeStandings(phase.value, true))

    const playOffs = computed(() => {
        if (!isStarted.value) {
            return []
        }

        return computePlayOffs(phase.value)
    })

    const unresolvedPlayOffs = useArrayFilter(
        playOffs,
        p => p.records.some(r => !r.tieBroken))

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

        return players.value.find(p => p.id === standings.value[0].playerId)!
    })

    const createPlayOffFor = (records: PlayerRecord[], forRank: number) => {
        const playerIds = records.map(r => r.playerId)

        const playOff: PlayOff = {
            id: uuidv4(),
            forRank,
            index: 0, // HIGH: assign this
            name: "Play-Off for Position " + forRank,
            players: players.value.filter(p => playerIds.includes(p.id)),
            records,
        }

        return playOff
    }

    return {
        standings,
        playOffs,
        unresolvedPlayOffs,
        orderedPlayOffs,
        requiresPlayOff,
        firstPlace,

        createPlayOffFor,
    }
}
