import { computed, ref } from "vue"
import type { MeterItem } from "primevue/metergroup"

import { MoneySplit, type FlyerSettings, Format, RuleSet } from "../data/FlyerSettings"

const rulesDetailsList = [
    {
        value: RuleSet.Blackball,
        details: "foul gives a free shot and a visit with ball-in-hand behind the baulk line, skill shots are permitted",
    },
    {
        value: RuleSet.International,
        details: "foul gives one visit with ball-in-hand, skill shots and loss-of-turn shots are permitted",
    },
]

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

    const rulesDetails = computed(() => rulesDetailsList.find(s => s.value === settings.value.ruleSet)?.details || "???")

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

        if (settings.value.moneySplit === MoneySplit.SixtyTwentyFiveFifteen) {
            return [roundX(prizePot.value * 0.6, 5), roundX(prizePot.value * 0.25, 5), roundX(prizePot.value * 0.15, 5)]
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
        rulesDetails,
        entryFeeSummary,
        prizePot,
        prizePotSummary,
        prizeMonies,
        prizeMoniesMeterItems,
    }
}
