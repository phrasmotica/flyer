import { computed, ref } from "vue"

import { useRankings } from "./useRankings"

import { Format, type FlyerSettings, TieBreaker } from "../data/FlyerSettings"
import type { Player } from "../data/Player"
import type { Result } from "../data/Result"

export const useStandings = (r: Result[], p: Player[], s: FlyerSettings) => {
    const results = ref(r)
    const players = ref(p)
    const settings = ref(s)

    const {
        computeStandings,
        computePlayOffs,
    } = useRankings()

    const standings = computed(() => computeStandings(results.value, players.value, settings.value))

    const playOffs = computed(() => computePlayOffs(results.value, players.value, settings.value))

    const orderedPlayOffs = computed(() => playOffs.value.sort((a, b) => b.forRank - a.forRank))

    const requiresPlayOff = computed(() => {
        return settings.value.tieBreaker === TieBreaker.PlayOff
            && settings.value.format === Format.RoundRobin
            && orderedPlayOffs.value.length > 0
    })

    const firstPlace = computed(() => {
        if (settings.value.format === Format.Knockout) {
            return null
        }

        const standings = computeStandings(results.value, players.value, settings.value)
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
