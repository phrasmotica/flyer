import { computed, ref } from "vue"

import { MoneySplit, type FlyerSettings } from "../data/FlyerSettings"
import type { MeterItem } from "primevue/metergroup"

export const useSettings = (s: FlyerSettings) => {
    const settings = ref(s)

    const entryFeeSummary = computed(() => {
        return `£${settings.value.entryFee} entry fee => £${prizePot.value} pot`
    })

    const prizePot = computed(() => settings.value.playerCount * settings.value.entryFee)

    const prizeMonies = computed(() => {
        if (!settings.value.entryFeeRequired) {
            return []
        }

        if (settings.value.moneySplit === MoneySplit.SeventyThirty) {
            return [roundX(prizePot.value * 0.7, 5), roundX(prizePot.value * 0.3, 5)]
        }

        return [prizePot.value]
    })

    const roundX = (v: number, multiple: number) => {
        return Math.round(v / multiple) * multiple
    }

    const colors = ["#34d399", "#fbbf24", "#60a5fa", "#c084fc"]
    const labels = ["1st", "2nd", "3rd", "4th", "5th", "6th", "7th", "8th"]

    const prizeMoniesMeterItems = computed(() => prizeMonies.value.map((x, i) => <MeterItem>{
        color: colors[i % colors.length],
        label: labels[i],
        value: x,
    }))

    const prizeMoniesSummary = computed(() => prizeMonies.value.map((x, i) => `${labels[i]}: £${x}`).join(", "))

    return {
        settings,

        entryFeeSummary,
        prizePot,
        prizeMonies,
        prizeMoniesMeterItems,
        prizeMoniesSummary,
    }
}
