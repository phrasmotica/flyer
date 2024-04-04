import { computed } from "vue"
import { useStorage } from "@vueuse/core"
import { defineStore } from "pinia"

import type { Flyer } from "../data/Flyer"

export const useFlyerHistoryStore = defineStore("flyerHistory", () => {
    const pastFlyers = useStorage("pastFlyers", <Flyer[]>[])

    const noHistory = computed(() => pastFlyers.value.length <= 0)

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

    return {
        pastFlyers,
        noHistory,

        add,
        importFlyers,
        deleteFlyer,
    }
})
