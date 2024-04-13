import { computed } from "vue"

import { useFixtureList } from "./useFixtureList"
import { usePhase } from "./usePhase"
import { usePhaseSettings } from "./usePhaseSettings"
import { usePlayers } from "./usePlayers"
import { usePrizes } from "./usePrizes"
import { useRankings } from "./useRankings"
import { useRounds } from "./useRounds"

import type { Phase } from "@/data/Phase"
import type { Winnings } from "@/data/Winnings"

// LOW: ideally this would not have to accept null, but useFlyer() currently
// accepts null (see ResultsTable.vue)
export const usePodium = (p: Phase | null) => {
    const {
        phase,
        settings,
    } = usePhase(p)

    const {
        players,
    } = usePlayers(phase.value)

    const {
        fixtures,
    } = useFixtureList(phase.value)

    const {
        rounds,
    } = useRounds(phase.value)

    const {
        getWinner,
    } = useRankings()

    const {
        isRoundRobin,
        isWinnerStaysOn,
    } = usePhaseSettings(settings.value)

    const {
        prizeMonies,
        prizeColours,
    } = usePrizes(settings.value, players.value.length)

    const finalists = computed<[string, string]>(() => {
        if (!phase.value) {
            return ["", ""]
        }

        if (!phase.value.startTime || !phase.value.finishTime) {
            return ["", ""]
        }

        if (isRoundRobin.value || isWinnerStaysOn.value) {
            return ["", ""]
        }

        const finalRound = rounds.value[rounds.value.length - 1]
        if (!finalRound) {
            return ["", ""]
        }

        const final = finalRound.fixtures[finalRound.fixtures.length - 1]

        const winnerId = getWinner(final)
        if (!winnerId) {
            return ["", ""]
        }

        return [
            winnerId,
            final.scores.filter(s => s.playerId !== winnerId)[0].playerId
        ]
    })

    const winner = computed(() => players.value.find(p => p.id === finalists.value[0]))
    const runnerUp = computed(() => players.value.find(p => p.id === finalists.value[1]))

    const winnerFixtures = computed(() => {
        if (!winner.value) {
            return []
        }

        const winnerFixtures = fixtures.value.filter(f => f.scores.some(s => s.playerId === winner.value!.id))

        // ensures reverse chronological order
        return winnerFixtures.reverse()
    })

    const losersByRound = computed(() => {
        const losersByRound = []

        let entrants = [...players.value]

        for (const r of rounds.value) {
            const winners = r.fixtures.map(f => getWinner(f) || "")
            const losers = entrants.filter(e => !winners.includes(e.id)).map(l => l.id)

            losersByRound.push({
                round: r.index,
                losers: losers.map(l => players.value.find(p => p.id === l)!),
            })

            entrants = entrants.filter(e => !losers.includes(e.id))
        }

        return losersByRound.reverse()
    })

    const moneyRecipients = computed(() => {
        if (!winner.value || prizeMonies.value.length <= 0) {
            return []
        }

        const recipients: Winnings[] = [
            {
                player: winner.value,
                amount: prizeMonies.value[0],
                colour: prizeColours.value[0],
            }
        ]

        if (prizeMonies.value.length <= 1) {
            return recipients
        }

        const remainingPrizeMonies = prizeMonies.value.slice(1)

        let r = 0
        let c = 1

        while (remainingPrizeMonies.length > 0) {
            const losers = losersByRound.value[r].losers
            if (losers.length > remainingPrizeMonies.length) {
                // these losers all got as far as each other - we can't divide
                // the prize money evenly between them
                break
            }

            for (const l of losers) {
                recipients.push({
                    player: l,
                    amount: remainingPrizeMonies.splice(0, 1)[0],
                    colour: prizeColours.value[c],
                })

                // keep using the last colour if necessary
                c = Math.min(c + 1, prizeColours.value.length - 1)
            }

            r++
        }

        return recipients
    })

    return {
        winner,
        winnerFixtures,
        runnerUp,
        moneyRecipients,
    }
}
