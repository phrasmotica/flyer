import { computed, ref } from "vue"
import type { MeterItem } from "primevue/metergroup"

import { useSchedulerForPhase } from "./useScheduler"

import type { Phase } from "../data/Phase"
import { MoneySplit, Format, TieBreaker, MatchLengthModel, type PhaseSettings } from "../data/PhaseSettings"

import { formatList, matchLengthModelList, ruleSetList, tieBreakerList } from "../stores/settings"

export const usePhaseSettings = (p: Phase | null) => {
    const phase = ref(p)

    const settings = computed(() => phase.value?.settings || <PhaseSettings>{})

    const {
        scheduler,
    } = useSchedulerForPhase(settings.value)

    const rounds = computed(() => phase.value?.rounds || [])
    const tables = computed(() => phase.value?.tables || [])

    const playerCount = computed(() => phase.value?.players.length || 0)

    const matchLengthModelName = computed(() => {
        const matchLengthModel = matchLengthModelList.find(s => s.value === settings.value.matchLengthModel)
        if (!matchLengthModel) {
            throw `Invalid match length model ${settings.value.matchLengthModel}!`
        }

        return matchLengthModel.name
    })

    const matchLengthModelSummary = computed(() => {
        const matchLengthModel = matchLengthModelList.find(s => s.value === settings.value.matchLengthModel)
        if (!matchLengthModel) {
            throw `Invalid match length model ${settings.value.matchLengthModel}!`
        }

        return matchLengthModel.summary
    })

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
        if (isKnockout.value) {
            return settings.value.randomlyDrawAllRounds ? "random draw" : "fixed draw"
        }

        return ""
    })

    const raceSummary = computed(() => {
        if (isVariableMatchLength.value) {
            return ""
        }

        return `Races to ${settings.value.raceTo}`
    })

    const variableRacesSummary = computed(() => {
        if (isFixedMatchLength.value) {
            return ""
        }

        return "Races to " + rounds.value
            .map(r => `${r.raceTo} (${r.name})`)
            .join(", then ")
    })

    const winsRequiredSummary = computed(() => {
        if (settings.value.winsRequired === 1) {
            return `First to ${settings.value.winsRequired} win`
        }

        return `First to ${settings.value.winsRequired} wins`
    })

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

    const isFixedMatchLength = computed(() => settings.value.matchLengthModel === MatchLengthModel.Fixed)
    const isVariableMatchLength = computed(() => settings.value.matchLengthModel === MatchLengthModel.Variable)

    const isKnockout = computed(() => settings.value.format === Format.Knockout)
    const isRoundRobin = computed(() => settings.value.format === Format.RoundRobin)
    const isWinnerStaysOn = computed(() => settings.value.format === Format.WinnerStaysOn)

    const isRandomDraw = computed(() => isKnockout.value && settings.value.randomlyDrawAllRounds)

    const maxTableCount = computed(() => {
        if (isWinnerStaysOn.value) {
            return 1
        }

        return Math.floor(playerCount.value / 2)
    })

    const usesPlayOff = computed(() => settings.value.tieBreaker === TieBreaker.PlayOff)

    const durationPerFrame = computed(() => scheduler.value.frameTimeEstimateMins)

    const estimatedDurationMinutes = computed(() => {
        return phase.value ? scheduler.value.estimateDurationForPhase(phase.value) : 0
    })

    const costPerHour = computed(() => tables.value.map(t => t.costPerHour).reduce((a, b) => a + b, 0))

    const estimatedCost = computed(() => costPerHour.value * estimatedDurationMinutes.value / 60)

    const prizePot = computed(() => playerCount.value * settings.value.entryFee)

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

    const prizeMoniesMeterItems = computed(() => prizeMonies.value.map<MeterItem>((x, i) => ({
        icon: "",
        color: prizeColours.value[Math.min(i, prizeColours.value.length - 1)],
        label: prizeLabels.value[i],
        value: x,
    })))

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
        costPerHour,
        estimatedCost,

        prizePot,
        prizeMonies,
        prizeColours,
        prizeMoniesMeterItems,
    }
}
