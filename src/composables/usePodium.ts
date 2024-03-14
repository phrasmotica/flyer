import { computed } from "vue"

import { useFlyer } from "./useFlyer"
import { useSettings } from "./useSettings"

import type { Fixture } from "../data/Fixture"
import type { Flyer } from "../data/Flyer"

// LOW: ideally this would not have to accept null, but useFlyer() currently
// accepts null (see ResultsTable.vue)
export const usePodium = (f: Flyer | null) => {
    const {
        flyer,
        fixtures,
        players,
        settings,
        rounds,
    } = useFlyer(f)

    const {
        isRoundRobin,
        isWinnerStaysOn,
        prizeMonies,
        prizeColours,
    } = useSettings(settings.value)

    const finalists = computed<[string, string]>(() => {
        if (!flyer.value) {
            return ["", ""]
        }

        if (!flyer.value.startTime || !flyer.value.finishTime) {
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
        const winnerId = getWinner(final).playerId

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
            const winners = r.fixtures.map(f => getWinner(f).playerId)
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

        const recipients = [
            {
                player: winner.value,
                winnings: prizeMonies.value[0],
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
                    winnings: remainingPrizeMonies.splice(0, 1)[0],
                    colour: prizeColours.value[c],
                })

                // keep using the last colour if necessary
                c = Math.min(c + 1, prizeColours.value.length - 1)
            }

            r++
        }

        return recipients
    })

    const getWinner = (f: Fixture) => f.scores.reduce((s, t) => s.score > t.score ? s : t)

    return {
        winner,
        winnerFixtures,
        runnerUp,
        moneyRecipients,
    }
}
