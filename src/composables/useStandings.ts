import { computed, ref } from "vue"

import { useRankings } from "./useRankings"
import { useSettings } from "./useSettings"

import { type FlyerSettings } from "../data/FlyerSettings"
import type { Player } from "../data/Player"
import type { Result } from "../data/Result"

export const useStandings = (r: Result[], p: Player[], s: FlyerSettings) => {
    const results = ref(r)
    const players = ref(p)

    const {
        settings,
        isKnockout,
        isRoundRobin,
        usesPlayOff,
        prizeMonies,
        prizeColours,
    } = useSettings(s)

    const {
        computeStandings,
        computePlayOffs,
    } = useRankings()

    const standings = computed(() => computeStandings(results.value, players.value, settings.value))

    const playOffs = computed(() => computePlayOffs(results.value, players.value, settings.value))

    const orderedPlayOffs = computed(() => playOffs.value.sort((a, b) => b.forRank - a.forRank))

    const requiresPlayOff = computed(() => {
        return usesPlayOff.value
            && isRoundRobin.value
            && orderedPlayOffs.value.length > 0
    })

    const firstPlace = computed(() => {
        if (isKnockout.value) {
            return null
        }

        const standings = computeStandings(results.value, players.value, settings.value)
        return players.value.find(p => p.id === standings[0].playerId)!
    })

    const moneyRecipients = computed(() => {
        if (!firstPlace.value || prizeMonies.value.length <= 0) {
            return []
        }

        const recipients = [
            {
                player: firstPlace.value,
                winnings: prizeMonies.value[0],
                colour: prizeColours.value[0],
            }
        ]

        if (prizeMonies.value.length <= 1) {
            return recipients
        }

        const remainingPrizeMonies = prizeMonies.value.slice(1)

        let c = 1

        while (remainingPrizeMonies.length > 0) {
            for (const s of standings.value.slice(1)) {
                recipients.push({
                    player: players.value.find(p => p.id === s.playerId)!,
                    winnings: remainingPrizeMonies.splice(0, 1)[0],
                    colour: prizeColours.value[c],
                })

                // keep using the last colour if necessary
                c = Math.min(c + 1, prizeColours.value.length - 1)
            }
        }

        return recipients
    })

    return {
        standings,
        playOffs,
        orderedPlayOffs,
        requiresPlayOff,
        firstPlace,
        moneyRecipients,
    }
}
