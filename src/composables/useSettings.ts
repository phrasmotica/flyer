import { computed, ref } from "vue"

import { MoneySplit, type FlyerSettings, Format } from "../data/FlyerSettings"
import type { MeterItem } from "primevue/metergroup"

export const useSettings = (s: FlyerSettings) => {
    const settings = ref(s)

    const formatSummary = computed(() => `${settings.value.format} format`)

    const drawSummary = computed(() => {
        if (settings.value.format === Format.RoundRobin) {
            return ""
        }

        return settings.value.randomlyDrawAllRounds ? "random draw" : "fixed draw"
    })

    const raceSummary = computed(() => `Races to ${settings.value.raceTo}`)

    const rulesSummary = computed(() => `${settings.value.ruleSet} rules`)

    const entryFeeSummary = computed(() => {
        return `£${settings.value.entryFee} entry fee => £${prizePot.value} pot`
    })

    const prizePot = computed(() => settings.value.playerCount * settings.value.entryFee)

    const prizePotSummary = computed(() => `£${prizePot.value}`)

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

    const colors = ["#ffd700", "#c0c0c0", "#a0522d", "#c084fc"]
    const labels = ["Winner", "Runner-Up", "3rd", "4th", "5th", "6th", "7th", "8th"]

    const prizeMoniesMeterItems = computed(() => prizeMonies.value.map((x, i) => <MeterItem>{
        color: colors[i % colors.length],
        label: labels[i],
        value: x,
    }))

    return {
        settings,

        formatSummary,
        drawSummary,
        raceSummary,
        rulesSummary,
        entryFeeSummary,
        prizePot,
        prizePotSummary,
        prizeMonies,
        prizeMoniesMeterItems,
    }
}
