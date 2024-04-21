import { computed, ref } from "vue"

import type { Phase } from "@/data/Phase"

import {
    Format,
    TieBreaker,
    MatchLengthModel,
    type Specification,
} from "@/data/Specification"

import {
    formatList,
    ruleSetList,
    tieBreakerList,
} from "@/stores/settings"

export const usePhaseSettings = (p: Phase | null) => {
    const phase = ref(p)

    // LOW: do something better here than casting an empty object to PhaseSettings
    const settings = computed(() => phase.value?.settings || <Specification>{})

    return useSpecification(settings.value)
}

export const useSpecification = (s: Specification) => {
    const settings = ref(s)

    const bestOf = computed(() => settings.value.bestOf)

    const raceTo = computed(() => {
        if (isRoundRobin.value) {
            return Math.ceil((bestOf.value + 1) / 2)
        }

        return isFixedMatchLength.value ? settings.value.raceTo : null
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

    const usesRunouts = computed(() => isRoundRobin.value && settings.value.tieBreaker === TieBreaker.Runouts)

    const fixturesCanBeDrawn = computed(() => isRoundRobin.value && bestOf.value % 2 === 0)

    return {
        settings,

        formatName,
        formatSummary,
        formatDetails,

        bestOf,
        raceTo,

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

        usesRunouts,

        fixturesCanBeDrawn,
    }
}
