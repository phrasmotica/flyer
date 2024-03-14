import { computed, ref } from "vue"
import { useSorted } from "@vueuse/core"

import { useRankings } from "./useRankings"
import { useSettings } from "./useSettings"

import type { Fixture } from "../data/Fixture"
import { type FlyerSettings } from "../data/FlyerSettings"
import type { Player } from "../data/Player"

export const useStandings = (f: Fixture[], p: Player[], s: FlyerSettings) => {
    const fixtures = ref(f)
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

        for (const s of standings.value.slice(1)) {
            if (remainingPrizeMonies.length > 0) {
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
