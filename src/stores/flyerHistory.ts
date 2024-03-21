import { useStorage } from "@vueuse/core"
import { defineStore } from "pinia"

import type { Fixture } from "../data/Fixture"
import type { Flyer } from "../data/Flyer"

export const useFlyerHistoryStore = defineStore("flyerHistory", () => {
    const pastFlyers = useStorage("pastFlyers", <Flyer[]>[])

    const add = (flyer: Flyer) => {
        pastFlyers.value = [...pastFlyers.value, flyer]
    }

    const importFlyers = (flyers: Flyer[]) => {
        pastFlyers.value = [...pastFlyers.value, ...flyers]
    }

    const deleteFlyer = (flyer: Flyer) => {
        const idx = pastFlyers.value.findIndex(f => f.id === flyer.id)
        if (idx >= 0) {
            const newFlyers = [...pastFlyers.value]
            newFlyers.splice(idx, 1)
            pastFlyers.value = newFlyers
        }
    }

    const getWinner = (flyer: Flyer) => {
        // MEDIUM: use mainPhase from useFlyer() instead of phases[0]
        const finalRound = flyer.phases[0].rounds[flyer.phases[0].rounds.length - 1]
        if (finalRound) {
            const final = finalRound.fixtures[finalRound.fixtures.length - 1]
            const id = getFixtureWinner(final).playerId
            return flyer.phases[0].players.find(p => p.id === id) || null
        }

        return null
    }

    const getFixtureWinner = (f: Fixture) => f.scores.reduce((s, t) => s.score > t.score ? s : t)

    return {
        pastFlyers,

        add,
        importFlyers,
        deleteFlyer,

        getWinner,
    }
})
