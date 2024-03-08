import { computed, ref } from "vue"
import type { MeterItem } from "primevue/metergroup"

import { useCurrency } from "./useCurrency"

import { MoneySplit, type FlyerSettings, Format, TieBreaker } from "../data/FlyerSettings"
import { KnockoutScheduler } from "../data/KnockoutScheduler"
import { RoundRobinScheduler } from "../data/RoundRobinScheduler"

import { formatList, ruleSetList, tieBreakerList } from "../stores/settings"

const { gbp } = useCurrency()

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
            const winnerPrize = roundX(prizePot.value * 0.55, 5)
            const runnerUpPrize = roundX(prizePot.value * 0.25, 5)
            const semiFinalistPrize = (prizePot.value - winnerPrize - runnerUpPrize) / 2
            return [winnerPrize, runnerUpPrize, semiFinalistPrize, semiFinalistPrize]
        }

        return [prizePot.value]
    })

    const roundX = (v: number, multiple: number) => {
        return Math.round(v / multiple) * multiple
    }

    const prizeColours = computed(() => ["#ffd700", "#c0c0c0", "#a0522d", "#c084fc"])
    const prizeLabels = computed(() => ["Winner", "Runner-Up", "3rd", "4th", "5th", "6th", "7th", "8th"])

    const prizeMoniesMeterItems = computed(() => prizeMonies.value.map((x, i) => <MeterItem>{
        color: prizeColours.value[Math.min(i, prizeColours.value.length - 1)],
        label: prizeLabels.value[i],
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

        drawSummary,
        raceSummary,

        rulesSummary,
        rulesDetails,

        tieBreakerSummary,
        tieBreakerDetails,

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
        prizeColours,
        prizeMoniesMeterItems,

        isInvalid,
    }
}
