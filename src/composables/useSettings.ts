import { computed, ref } from "vue"
import type { MeterItem } from "primevue/metergroup"

import { MoneySplit, type FlyerSettings, Format, TieBreaker } from "../data/FlyerSettings"
import { KnockoutScheduler } from "../data/KnockoutScheduler"
import { RoundRobinScheduler } from "../data/RoundRobinScheduler"

import { formatList, ruleSetList, tieBreakerList } from "../stores/settings"

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

    const tieBreakerName = computed(() => tieBreakerList.find(s => s.value === settings.value.tieBreaker)?.name || "???")

    const tieBreakerSummary = computed(() => tieBreakerList.find(s => s.value === settings.value.tieBreaker)?.summary || "???")

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

    const prizePot = computed(() => settings.value.playerCount * settings.value.entryFee)

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

    // LOW: vary colours and labels depending on the flyer format and
    // relative amount of winnings for each place in the standings. E.g. if the
    // two losing semi-finalists in a knockout tournament each win the same
    // amount, perhaps their prize colours should be the same?
    const prizeColours = computed(() => ["#ffd700", "#c0c0c0", "#a0522d", "#c084fc"])

    const prizeLabels = computed(() => {
        if (isKnockout.value) {
            return [
                "Winner",
                "Runner-Up",
                "Semi-Finalist 1", "Semi-Finalist 2",
                "Quarter-Finalist 1", "Quarter-Finalist 2", "Quarter-Finalist 3", "Quarter-Finalist 4"
            ]
        }

        return ["Winner", "Runner-Up", "3rd Place", "4th Place", "5th Place", "6th Place", "7th Place", "8th Place"]
    })

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

        tieBreakerName,
        tieBreakerSummary,
        tieBreakerDetails,

        isKnockout,
        isRoundRobin,
        isRandomDraw,
        usesPlayOff,

        durationPerFrame,
        estimatedDuration,
        estimatedCost,

        prizePot,
        prizeMonies,
        prizeColours,
        prizeMoniesMeterItems,

        isInvalid,
    }
}