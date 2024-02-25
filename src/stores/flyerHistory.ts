import { useStorage } from "@vueuse/core"
import { defineStore } from "pinia"

import type { Flyer } from "../data/Flyer"
import type { Result } from "../data/Result"

export const useFlyerHistoryStore = defineStore("flyerHistory", () => {
    const pastFlyers = useStorage("pastFlyers", <Flyer[]>[])

    const add = (flyer: Flyer) => {
        pastFlyers.value = [...pastFlyers.value, flyer]
    }

    const getWinner = (flyer: Flyer) => {
        const finalRound = flyer.rounds[flyer.rounds.length - 1]
        if (finalRound) {
            const final = finalRound.fixtures[finalRound.fixtures.length - 1]
            const id = getResultWinner(final).playerId
            return flyer.players.find(p => p.id === id) || null
        }

        return null
    }

    const getResultWinner = (f: Result) => f.scores.reduce((s, t) => s.score > t.score ? s : t)

    return {
        pastFlyers,

        add,

        getWinner,
    }
})
