import { computed, ref } from "vue"

import { usePlayers } from "./usePlayers"
import { usePrizes } from "./usePrizes"
import { useRankings } from "./useRankings"
import { usePhaseSpecification } from "./useSpecification"

import type { Flyer } from "@/data/Flyer"
import type { PlayerRecord } from "@/data/PlayerRecord"
import type { Winnings } from "@/data/Winnings"

export const usePlayOffs = (f: Flyer | null) => {
    const flyer = ref(f)

    const mainPhase = computed(() => flyer.value?.phases[0] || null)

    const playOffPhases = computed(() => flyer.value?.phases.slice(1) || [])

    const {
        players,
    } = usePlayers(mainPhase.value)

    const {
        computeStandings,
    } = useRankings()

    const {
        settings,
    } = usePhaseSpecification(mainPhase.value)

    const {
        prizeMonies,
        prizeColours,
    } = usePrizes(settings.value, players.value.length)

    const completedPlayOffs = computed(() => playOffPhases.value.filter(p => {
        return p.skippedTime || (p.startTime && p.finishTime)
    }))

    const standings = computed(() => playOffPhases.value.map(p => computeStandings(p, true)))

    const findPlayOffIndex = (playerId: string) => {
        return playOffPhases.value.findIndex(p => p.players.some(x => x.id === playerId))
    }

    const playOffWasSkipped = (playerId: string) => {
        const playOffIdx = findPlayOffIndex(playerId)
        if (playOffIdx < 0) {
            return false
        }

        return !!playOffPhases.value[playOffIdx].skippedTime
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

        const recipients: Winnings[] = []
        const remainingPrizeMonies = [...prizeMonies.value]

        let c = 0

        for (const s of finalStandings) {
            if (remainingPrizeMonies.length > 0) {
                recipients.push({
                    player: players.value.find(p => p.id === s.playerId)!,
                    amount: remainingPrizeMonies.shift()!,
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

        playOffWasSkipped,
        getPlayOffRank,
        processStandings,
        getMoneyRecipients,
    }
}
