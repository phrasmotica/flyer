import { computed, ref } from "vue"

import { useRankings } from "./useRankings"

import type { Phase } from "../data/Phase"
import type { PlayerRecord } from "../data/PlayerRecord"

export const usePlayOffs = (p: Phase[]) => {
    const playOffs = ref(p)

    const {
        computeStandings,
    } = useRankings()

    const completedPlayOffs = computed(() => playOffs.value.filter(p => p.startTime && p.finishTime))

    const standings = computed(() => playOffs.value.map(p => computeStandings(
        p.rounds.flatMap(r => r.fixtures),
        p.players,
        p.settings,
    )))

    const findPlayOffIndex = (playerId: string) => {
        return playOffs.value.findIndex(p => p.players.some(x => x.id === playerId))
    }

    const getPlayOffRank = (playerId: string) => {
        const playOffIdx = findPlayOffIndex(playerId)
        if (playOffIdx < 0) {
            return null
        }

        const relevantStandings = standings.value[playOffIdx]

        const idx = relevantStandings.findIndex(d => d.playerId === playerId)
        return idx >= 0 ? idx + 1 : null
    }

    const processStandings = (initialStandings: PlayerRecord[]) => {
        const finalStandings = [...initialStandings]

        for (let s of standings.value) {
            finalStandings.sort((p, q) => {
                const pIdx = s.findIndex(x => x.playerId === p.playerId)
                const qIdx = s.findIndex(x => x.playerId === q.playerId)

                if (pIdx >= 0 && qIdx >= 0) {
                    return pIdx - qIdx
                }

                return 0
            })
        }

        return finalStandings.map((p, i) => <PlayerRecord>{ ...p, rank: i + 1 })
    }

    return {
        standings,
        completedPlayOffs,

        getPlayOffRank,
        processStandings,
    }
}
