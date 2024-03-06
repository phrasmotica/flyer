import { computed, ref } from "vue"

import { useRankings } from "./useRankings"

import type { Flyer } from "../data/Flyer"
import type { FlyerSettings } from "../data/FlyerSettings"
import type { PlayerRecord } from "../data/PlayerRecord"

export const usePlayOffs = (p: Flyer[]) => {
    const playOffs = ref(p)

    const {
        computeStandings,
    } = useRankings()

    const standings = computed(() => playOffs.value.map(p => computeStandings(
        getResults(p.id),
        getPlayers(p.id),
        getSettings(p.id),
    )))

    const somePlayOffComplete = computed(() => playOffs.value.length > 0)

    const getPlayers = (id: string) => {
        const playOff = playOffs.value.find(x => x.id === id)
        return playOff?.players || []
    }

    const getResults = (id: string) => {
        const playOff = playOffs.value.find(x => x.id === id)
        return playOff?.rounds.flatMap(r => r.fixtures) || []
    }

    const getSettings = (id: string) => {
        const playOff = playOffs.value.find(x => x.id === id)
        return playOff?.settings || <FlyerSettings>{}
    }

    const findPlayOff = (playerId: string) => {
        return playOffs.value.find(p => p.players.some(x => x.id === playerId))
    }

    const getPlayOffRank = (playerId: string) => {
        const playOff = findPlayOff(playerId)
        if (!playOff) {
            return null
        }

        const standings = computeStandings(getResults(playOff.id), getPlayers(playOff.id), getSettings(playOff.id))
        const idx = standings.findIndex(d => d.playerId === playerId)
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
        playOffs,

        standings,
        somePlayOffComplete,

        getPlayOffRank,
        processStandings,
    }
}
