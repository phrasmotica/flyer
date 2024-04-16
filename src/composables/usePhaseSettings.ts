import { computed, ref } from "vue"

import type { Phase } from "@/data/Phase"
import { Format, TieBreaker, MatchLengthModel, type PhaseSettings } from "@/data/PhaseSettings"

import { formatList, ruleSetList, tieBreakerList } from "@/stores/settings"

export const usePhaseSettings = (p: Phase | null) => {
    const phase = ref(p)

    // LOW: do something better here than casting an empty object to PhaseSettings
    const settings = computed(() => phase.value?.settings || <PhaseSettings>{})

    return usePhaseSettingsInternal(settings.value)
}

// MEDIUM: name this something better...
export const usePhaseSettingsInternal = (s: PhaseSettings) => {
    const settings = ref(s)

    const bestOf = computed(() => {
        return isFixedMatchLength.value ? settings.value.bestOf : null
    })

    const raceTo = computed(() => {
        if (bestOf.value) {
            return Math.ceil((bestOf.value + 1) / 2)
        }

        return null
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

    const bestOfSummary = computed(() => {
        if (isVariableMatchLength.value) {
            return ""
        }

        // HIGH: allow localisation
        return `Best of ${bestOf.value}`
    })

    const raceSummary = computed(() => {
        if (isVariableMatchLength.value) {
            return ""
        }

        // HIGH: allow localisation
        return `Races to ${raceTo.value}`
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
    const usesRunouts = computed(() => isRoundRobin.value && settings.value.tieBreaker === TieBreaker.Runouts)

    return {
        settings,

        formatName,
        formatSummary,
        formatDetails,

        drawSummary,
        bestOfSummary,
        raceSummary,
        bestOf,
        raceTo,
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
        usesRunouts,
    }
}
