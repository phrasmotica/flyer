import { computed, ref } from "vue"
import type { MeterItem } from "primevue/metergroup"

import { useCurrency } from "./useCurrency"

import { MoneySplit, type FlyerSettings, Format, RuleSet, TieBreaker } from "../data/FlyerSettings"
import { KnockoutScheduler } from "../data/KnockoutScheduler"
import { RoundRobinScheduler } from "../data/RoundRobinScheduler"

const { gbp } = useCurrency()

// TODO: move these lists to the settings store
const formatList = [
    {
        value: Format.Knockout,
        name: "Knockout",
        summary: "Knockout format",
        details: "losers are immediately eliminated until one player remains",
    },
    {
        value: Format.RoundRobin,
        name: "Round-Robin",
        summary: "Round-Robin format",
        details: "every player plays against every other player once",
    },
]

const ruleSetList = [
    {
        value: RuleSet.Blackball,
        name: "Blackball",
        summary: "Blackball rules",
        details: "foul gives a free shot and a visit with ball-in-hand behind the baulk line, skill shots are permitted",
    },
    {
        value: RuleSet.International,
        name: "International",
        summary: "International rules",
        details: "foul gives one visit with ball-in-hand, skill shots and loss-of-turn shots are permitted",
    },
]

const tieBreakerList = [
    {
        value: TieBreaker.HeadToHead,
        name: "Head-to-Head",
        details: "decided by the tied players' head-to-head records",
    },
    {
        value: TieBreaker.PlayOff,
        name: "Play-Off",
        details: "decided by a race-to-1 knockout play-off between the tied players",
    },
    {
        value: TieBreaker.Runouts,
        name: "Runouts",
        details: "decided by the number of runouts made by the tied players",
    },
]

export const useSettings = (s: FlyerSettings) => {
    const settings = ref(s)

    const formatName = computed(() => {
        const format = formatList.find(s => s.value === settings.value.format)
        if (!format) {
            throw `Invalid format ${settings.value.format}!`
        }

        return format.name
    })

    const formatSummary = computed(() => {
        const format = formatList.find(s => s.value === settings.value.format)
        if (!format) {
            throw `Invalid format ${settings.value.format}!`
        }

        return format.summary
    })

    const formatDetails = computed(() => {
        const format = formatList.find(s => s.value === settings.value.format)
        if (!format) {
            throw `Invalid format ${settings.value.format}!`
        }

        return format.details
    })

    const drawSummary = computed(() => {
        if (isRoundRobin.value) {
            return ""
        }

        return settings.value.randomlyDrawAllRounds ? "random draw" : "fixed draw"
    })

    const raceSummary = computed(() => `Races to ${settings.value.raceTo}`)

    const rulesSummary = computed(() => {
        const ruleSet = ruleSetList.find(s => s.value === settings.value.ruleSet)
        if (!ruleSet) {
            throw `Invalid rule set ${settings.value.ruleSet}!`
        }

        return ruleSet.summary
    })

    const rulesDetails = computed(() => {
        const ruleSet = ruleSetList.find(s => s.value === settings.value.ruleSet)
        if (!ruleSet) {
            throw `Invalid rule set ${settings.value.ruleSet}!`
        }

        return ruleSet.details
    })

    const tieBreakerSummary = computed(() => `${settings.value.tieBreaker} tie-breaker`)

    const tieBreakerDetails = computed(() => tieBreakerList.find(s => s.value === settings.value.tieBreaker)?.details || "???")

    const isKnockout = computed(() => settings.value.format === Format.Knockout)
    const isRoundRobin = computed(() => settings.value.format === Format.RoundRobin)

    const isRandomDraw = computed(() => isKnockout.value && settings.value.randomlyDrawAllRounds)

    const usesPlayOff = computed(() => settings.value.tieBreaker === TieBreaker.PlayOff)

    const durationPerFrame = computed(() => {
        if (isKnockout.value) {
            return new KnockoutScheduler(settings.value.randomlyDrawAllRounds).frameTimeEstimateMins
        }

        if (isRoundRobin.value) {
            return new RoundRobinScheduler().frameTimeEstimateMins
        }

        throw `Invalid flyer format ${settings.value.format}!`
    })

    const estimatedDuration = computed(() => {
        if (isKnockout.value) {
            return new KnockoutScheduler(settings.value.randomlyDrawAllRounds).estimateDuration(settings.value)
        }

        if (isRoundRobin.value) {
            return new RoundRobinScheduler().estimateDuration(settings.value)
        }

        throw `Invalid flyer format ${settings.value.format}!`
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

        if (settings.value.moneySplit === MoneySplit.SemiFinalists) {
            const winnerPrize = roundX(prizePot.value * 0.45, 5)
            const runnerUpPrize = roundX(prizePot.value * 0.25, 5)
            const semiFinalistPrize = (prizePot.value - winnerPrize - runnerUpPrize) / 2
            return [winnerPrize, runnerUpPrize, semiFinalistPrize, semiFinalistPrize]
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

    const isInvalid = computed(() => {
        const actualPlayerNames = settings.value.playerNames.slice(0, settings.value.playerCount)
        return actualPlayerNames.some(p => !p)
    })

    return {
        settings,

        formatName,
        formatSummary,
        formatDetails,
        formatList,

        drawSummary,
        raceSummary,

        rulesSummary,
        rulesDetails,
        ruleSetList,

        tieBreakerSummary,
        tieBreakerDetails,
        tieBreakerList,

        isKnockout,
        isRoundRobin,
        isRandomDraw,
        usesPlayOff,

        durationPerFrame,
        estimatedDuration,
        estimatedCost,

        entryFeeSummary,
        prizePot,
        prizePotSummary,
        prizeMonies,
        prizeMoniesMeterItems,

        isInvalid,
    }
}
