import { computed, ref } from "vue"
import type { MeterItem } from "primevue/metergroup"

import { useScheduler } from "./useScheduler"

import type { FlyerSettings } from "../data/FlyerSettings"
import { MoneySplit, Format, TieBreaker, MatchLengthModel } from "../data/PhaseSettings"
import { KnockoutScheduler } from "../data/KnockoutScheduler"

import { formatList, matchLengthModelList, ruleSetList, tieBreakerList } from "../stores/settings"

export const useSettings = (s: FlyerSettings) => {
    const settings = ref(s)

    const specification = computed(() => settings.value.specification)

    const {
        scheduler,
    } = useScheduler(s)

    const matchLengthModelName = computed(() => {
        const matchLengthModel = matchLengthModelList.find(s => s.value === specification.value.matchLengthModel)
        if (!matchLengthModel) {
            throw `Invalid match length model ${specification.value.matchLengthModel}!`
        }

        return matchLengthModel.name
    })

    const matchLengthModelSummary = computed(() => {
        const matchLengthModel = matchLengthModelList.find(s => s.value === specification.value.matchLengthModel)
        if (!matchLengthModel) {
            throw `Invalid match length model ${specification.value.matchLengthModel}!`
        }

        return matchLengthModel.summary
    })

    const formatName = computed(() => {
        const format = formatList.find(s => s.value === specification.value.format)
        if (!format) {
            throw `Invalid format ${specification.value.format}!`
        }

        return format.name
    })

    const formatSummary = computed(() => {
        const format = formatList.find(s => s.value === specification.value.format)
        if (!format) {
            throw `Invalid format ${specification.value.format}!`
        }

        return format.summary
    })

    const formatDetails = computed(() => {
        const format = formatList.find(s => s.value === specification.value.format)
        if (!format) {
            throw `Invalid format ${specification.value.format}!`
        }

        return format.details
    })

    const drawSummary = computed(() => {
        if (isKnockout.value) {
            return specification.value.randomlyDrawAllRounds ? "random draw" : "fixed draw"
        }

        return ""
    })

    const raceSummary = computed(() => {
        if (isVariableMatchLength.value) {
            return ""
        }

        return `Races to ${specification.value.raceTo}`
    })

    const variableRacesSummary = computed(() => {
        if (isFixedMatchLength.value) {
            return ""
        }

        return "Races to " + settings.value.raceToPerRound
            .slice(0, roundNames.value.length)
            .map((r, i) => `${r} (${roundNames.value[i]})`)
            .join(", then ")
    })

    const winsRequiredSummary = computed(() => {
        if (specification.value.winsRequired === 1) {
            return `First to ${specification.value.winsRequired} win`
        }

        return `First to ${specification.value.winsRequired} wins`
    })

    const rulesSummary = computed(() => {
        const ruleSet = ruleSetList.find(s => s.value === specification.value.ruleSet)
        if (!ruleSet) {
            throw `Invalid rule set ${specification.value.ruleSet}!`
        }

        return ruleSet.summary
    })

    const rulesDetails = computed(() => {
        const ruleSet = ruleSetList.find(s => s.value === specification.value.ruleSet)
        if (!ruleSet) {
            throw `Invalid rule set ${specification.value.ruleSet}!`
        }

        return ruleSet.details
    })

    const tieBreakerName = computed(() => tieBreakerList.find(s => s.value === specification.value.tieBreaker)?.name || "???")

    const tieBreakerSummary = computed(() => tieBreakerList.find(s => s.value === specification.value.tieBreaker)?.summary || "???")

    const tieBreakerDetails = computed(() => tieBreakerList.find(s => s.value === specification.value.tieBreaker)?.details || "???")

    const isFixedMatchLength = computed(() => specification.value.matchLengthModel === MatchLengthModel.Fixed)
    const isVariableMatchLength = computed(() => specification.value.matchLengthModel === MatchLengthModel.Variable)

    const isKnockout = computed(() => specification.value.format === Format.Knockout)
    const isRoundRobin = computed(() => specification.value.format === Format.RoundRobin)
    const isWinnerStaysOn = computed(() => specification.value.format === Format.WinnerStaysOn)

    const isRandomDraw = computed(() => isKnockout.value && specification.value.randomlyDrawAllRounds)

    const maxTableCount = computed(() => {
        if (isWinnerStaysOn.value) {
            return 1
        }

        return Math.floor(settings.value.playerCount / 2)
    })

    const usesPlayOff = computed(() => specification.value.tieBreaker === TieBreaker.PlayOff)

    const durationPerFrame = computed(() => scheduler.value.frameTimeEstimateMins)

    const estimatedDurationMinutes = computed(() => scheduler.value.estimateDuration(settings.value))

    const roundNames = computed(() => {
        // MEDIUM: generalise this
        if (isKnockout.value) {
            return new KnockoutScheduler().computeRoundNames(settings.value.playerCount)
        }

        return []
    })

    const costPerHour = computed(() => {
        const tablesToUse = settings.value.tables.slice(0, settings.value.tableCount)
        const meanCostPerHour = tablesToUse.map(t => t.costPerHour).reduce((a, b) => a + b, 0) / tablesToUse.length
        return meanCostPerHour * settings.value.tableCount
    })

    const estimatedCost = computed(() => costPerHour.value * estimatedDurationMinutes.value / 60)

    const prizePot = computed(() => settings.value.playerCount * specification.value.entryFee)

    const prizeMonies = computed(() => {
        if (!specification.value.entryFeeRequired) {
            return []
        }

        if (specification.value.moneySplit === MoneySplit.SeventyThirty) {
            const winnerPrize = roundX(prizePot.value * 0.7, 5)
            return [winnerPrize, prizePot.value - winnerPrize]
        }

        if (specification.value.moneySplit === MoneySplit.SixtyTwentyFiveFifteen) {
            const winnerPrize = roundX(prizePot.value * 0.6, 5)
            const runnerUpPrize = roundX(prizePot.value * 0.25, 5)
            return [winnerPrize, runnerUpPrize, prizePot.value - winnerPrize - runnerUpPrize]
        }

        if (specification.value.moneySplit === MoneySplit.SemiFinalists) {
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

    const prizeMoniesMeterItems = computed(() => prizeMonies.value.map<MeterItem>((x, i) => ({
        icon: "",
        color: prizeColours.value[Math.min(i, prizeColours.value.length - 1)],
        label: prizeLabels.value[i],
        value: x,
    })))

    const isInvalid = computed(() => {
        const actualPlayerNames = settings.value.playerNames.slice(0, settings.value.playerCount)
        return actualPlayerNames.some(p => !p)
    })

    return {
        settings,

        matchLengthModelName,
        matchLengthModelSummary,

        formatName,
        formatSummary,
        formatDetails,

        drawSummary,
        raceSummary,
        variableRacesSummary,
        winsRequiredSummary,

        rulesSummary,
        rulesDetails,

        tieBreakerName,
        tieBreakerSummary,
        tieBreakerDetails,

        isFixedMatchLength,
        isVariableMatchLength,
        isKnockout,
        isRoundRobin,
        isWinnerStaysOn,
        isRandomDraw,
        maxTableCount,
        usesPlayOff,

        durationPerFrame,
        estimatedDurationMinutes,
        roundNames,
        costPerHour,
        estimatedCost,

        prizePot,
        prizeMonies,
        prizeColours,
        prizeMoniesMeterItems,

        isInvalid,
    }
}
