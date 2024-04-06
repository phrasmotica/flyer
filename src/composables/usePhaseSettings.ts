import { computed, ref } from "vue"

import { Format, TieBreaker, MatchLengthModel, type PhaseSettings } from "@/data/PhaseSettings"

import { formatList, matchLengthModelList, ruleSetList, tieBreakerList } from "@/stores/settings"

export const usePhaseSettings = (s: PhaseSettings) => {
    const settings = ref(s)

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

    const usesPlayOff = computed(() => settings.value.tieBreaker === TieBreaker.PlayOff)

    return {
        settings,

        matchLengthModelName,
        matchLengthModelSummary,

        formatName,
        formatSummary,
        formatDetails,

        drawSummary,
        raceSummary,
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
        usesPlayOff,
    }
}
