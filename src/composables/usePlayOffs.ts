import { computed, ref } from "vue"

import { usePhase } from "./usePhase"
import { usePrizes } from "./usePrizes"
import { useRankings } from "./useRankings"

import type { Phase } from "@/data/Phase"
import type { PlayerRecord } from "@/data/PlayerRecord"

export const usePlayOffs = (p: Phase[], mp: Phase | null) => {
    const playOffs = ref(p)

    const {
        settings,
        players,
    } = usePhase(mp)

    const {
        computeStandings,
    } = useRankings()

    const {
        prizeMonies,
        prizeColours,
    } = usePrizes(settings.value, players.value.length)

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

        return finalStandings.map<PlayerRecord>((p, i) => ({ ...p, rank: i + 1 }))
    }

    const getMoneyRecipients = (initialStandings: PlayerRecord[]) => {
        const finalStandings = processStandings(initialStandings)

        const recipients = []
        const remainingPrizeMonies = [...prizeMonies.value]

        let c = 0

        for (const s of finalStandings) {
            if (remainingPrizeMonies.length > 0) {
                recipients.push({
                    player: players.value.find(p => p.id === s.playerId)!,
                    winnings: remainingPrizeMonies.shift()!,
                    colour: prizeColours.value[c],
                })

                // keep using the last colour if necessary
                c = Math.min(c + 1, prizeColours.value.length - 1)
            }
        }

        return recipients
    }

    return {
        standings,
        completedPlayOffs,

        getPlayOffRank,
        processStandings,
        getMoneyRecipients,
    }
}
