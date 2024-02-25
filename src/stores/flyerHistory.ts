import { useStorage } from "@vueuse/core"
import { defineStore } from "pinia"

import type { Flyer } from "../data/Flyer"

export const useFlyerHistoryStore = defineStore("flyerHistory", () => {
    const pastFlyers = useStorage("pastFlyers", <Flyer[]>[])

    const add = (flyer: Flyer) => {
        pastFlyers.value = [...pastFlyers.value, flyer]
    }

    return {
        pastFlyers,

        add,
    }
})
