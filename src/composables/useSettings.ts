import { computed, ref } from "vue"
import type { MeterItem } from "primevue/metergroup"

import { useCurrency } from "./useCurrency"

import { MoneySplit, type FlyerSettings, Format, RuleSet, TieBreaker } from "../data/FlyerSettings"
import { KnockoutScheduler } from "../data/KnockoutScheduler"
import { RoundRobinScheduler } from "../data/RoundRobinScheduler"

const { gbp } = useCurrency()

const formatDetailsList = [
    {
        value: Format.Knockout,
        details: "losers are immediately eliminated until one player remains",
    },
    {
        value: Format.RoundRobin,
        details: "every player plays against every other player once",
    },
]

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

const tieBreakerDetailsList = [
    {
        value: TieBreaker.HeadToHead,
        details: "decided by the tied players' head-to-head records",
    },
    {
        value: TieBreaker.PlayOff,
        details: "decided by a race-to-1 knockout play-off between the tied players",
    },
    {
        value: TieBreaker.Runouts,
        details: "decided by the number of runouts made by the tied players",
    },
]

export const useSettings = (s: FlyerSettings) => {
    const settings = ref(s)

    const formatSummary = computed(() => `${settings.value.format} format`)

    const formatDetails = computed(() => formatDetailsList.find(s => s.value === settings.value.format)?.details || "???")

    const drawSummary = computed(() => {
        if (settings.value.format === Format.RoundRobin) {
            return ""
        }

        return settings.value.randomlyDrawAllRounds ? "random draw" : "fixed draw"
    })

    const raceSummary = computed(() => `Races to ${settings.value.raceTo}`)

    const rulesSummary = computed(() => `${settings.value.ruleSet} rules`)

    const rulesDetails = computed(() => rulesDetailsList.find(s => s.value === settings.value.ruleSet)?.details || "???")

    const tieBreakerSummary = computed(() => `${settings.value.tieBreaker} tie-breaker`)

    const tieBreakerDetails = computed(() => tieBreakerDetailsList.find(s => s.value === settings.value.tieBreaker)?.details || "???")

    const isKnockout = computed(() => settings.value.format === Format.Knockout)

    const isRandomDraw = computed(() => isKnockout.value && settings.value.randomlyDrawAllRounds)

    const estimatedDuration = computed(() => {
        switch (settings.value.format) {
            case Format.Knockout:
                return new KnockoutScheduler(settings.value.randomlyDrawAllRounds).estimateDuration(settings.value)

            case Format.RoundRobin:
                return new RoundRobinScheduler().estimateDuration(settings.value)

            default:
                throw `Invalid flyer format ${settings.value.format}!`
        }
    })

    const estimatedCost = computed(() => {
        return settings.value.tableCostPerHour * settings.value.tableCount * estimatedDuration.value / 60
    })

    const entryFeeSummary = computed(() => {
        return `${gbp(settings.value.entryFee)} entry fee => ${gbp(prizePot.value)} pot`
    })

    const prizePot = computed(() => settings.value.playerCount * settings.value.entryFee)

    const prizePotSummary = computed(() => `${gbp(prizePot.value)}`)

    const prizeMonies = computed(() => {
        if (!settings.value.entryFeeRequired) {
            return []
        }

        if (settings.value.moneySplit === MoneySplit.SeventyThirty) {
            const winnerPrize = roundX(prizePot.value * 0.7, 5)
            return [winnerPrize, prizePot.value - winnerPrize]
        }

        if (settings.value.moneySplit === MoneySplit.SixtyTwentyFiveFifteen) {
            const winnerPrize = roundX(prizePot.value * 0.6, 5)
            const runnerUpPrize = roundX(prizePot.value * 0.25, 5)
            return [winnerPrize, runnerUpPrize, prizePot.value - winnerPrize - runnerUpPrize]
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
        formatDetails,
        drawSummary,
        raceSummary,
        rulesSummary,
        rulesDetails,
        tieBreakerSummary,
        tieBreakerDetails,
        isKnockout,
        isRandomDraw,
        estimatedDuration,
        estimatedCost,
        entryFeeSummary,
        prizePot,
        prizePotSummary,
        prizeMonies,
        prizeMoniesMeterItems,
    }
}
