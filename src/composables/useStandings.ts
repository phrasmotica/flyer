import { useArrayFilter, useSorted } from "@vueuse/core"
import { v4 as uuidv4 } from "uuid"
import { computed } from "vue"

import { usePhase } from "./usePhase"
import { usePlayers } from "./usePlayers"
import { useRankings } from "./useRankings"
import { usePhaseSpecification } from "./useSpecification"

import type { Phase } from "@/data/Phase"
import type { PlayerRecord } from "@/data/PlayerRecord"
import type { TieBreakerInfo } from "@/data/TieBreakerInfo"

export const useStandings = (p: Phase | null) => {
    const {
        phase,
    } = usePhase(p)

    const {
        players,
    } = usePlayers(phase.value)

    const {
        isKnockout,
    } = usePhaseSpecification(phase.value)

    const {
        computeStandings,
    } = useRankings()

    const standings = computed(() => computeStandings(phase.value, true))

    const tieBreakers = computed(() => phase.value?.tieBreakers || [])

    const orderedTieBreakers = useSorted(tieBreakers, (a, b) => b.forRank - a.forRank)

    const unresolvedTieBreakers = useArrayFilter(
        orderedTieBreakers,
        p => p.records.some(r => !r.tieBroken))

    const firstPlace = computed(() => {
        if (isKnockout.value) {
            return null
        }

        return players.value.find(p => p.id === standings.value[0].playerId)!
    })

    const createPlayOffFor = (records: PlayerRecord[], forRank: number) => {
        const playerIds = records.map(r => r.playerId)

        const tieBreaker: TieBreakerInfo = {
            id: uuidv4(),
            forRank,
            index: 0,
            name: "Play-Off for Position " + forRank,
            players: players.value.filter(p => playerIds.includes(p.id)),
            records,
        }

        return tieBreaker
    }

    return {
        standings,

        tieBreakers,
        unresolvedTieBreakers,

        firstPlace,

        createPlayOffFor,
    }
}
