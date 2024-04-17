<script setup lang="ts">
import { computed } from "vue"
import { useI18n } from "vue-i18n"

import { usePhaseSettingsInternal } from "@/composables/usePhaseSettings"

import type { PhaseSettings } from "@/data/PhaseSettings"

const { t } = useI18n()

const props = defineProps<{
    settings: PhaseSettings
    playerCount: number
    tableCount: number
    raceTos: {
        name: string
        raceTo: number | null
    }[]
}>()

const {
    settings,
    formatSummary,
    formatDetails,
    bestOf,
    raceTo,
    rulesSummary,
    rulesDetails,
    tieBreakerSummary,
    tieBreakerDetails,
    isRandomDraw,
    isKnockout,
    isRoundRobin,
    isWinnerStaysOn,
    isFixedMatchLength,
} = usePhaseSettingsInternal(props.settings)

const winsRequiredSummary = computed(() => {
    return t('matchLengthModel.firstToNWins', settings.value.winsRequired)
})

const bestOfSummary = computed(() => {
    if (!isRoundRobin.value) {
        return ""
    }

    return t('matchLengthModel.bestOfN', bestOf.value)
})

const raceSummary = computed(() => {
    if (!isKnockout.value || !raceTo.value) {
        return ""
    }

    return t('matchLengthModel.racesToN', raceTo.value)
})

const variableRacesSummary = computed(() => {
    if (isFixedMatchLength.value) {
        return ""
    }

    // HIGH: localise
    return "Races to " + props.raceTos
        .map(r => `${r.raceTo!} (${r.name})`)
        .join(", then ")
})

const drawSummary = computed(() => {
    if (isRandomDraw.value) {
        return t('format.randomDraw')
    }

    return t('format.fixedDraw')
})

const stagesSummary = computed(() => {
    if (isRoundRobin.value) {
        return t("common.nTimes", settings.value.stageCount)
    }

    return ""
})
</script>

<template>
    <div class="mb-2">
        <strong>{{ t('form.playerCount', props.playerCount) }}</strong>&nbsp;{{ t('common.on') }}&nbsp;<strong>{{ t('form.tableCount', props.tableCount) }}</strong>
    </div>

    <div class="pt-2 border-top-1 border-gray-200 mb-2">
        <strong v-if="isWinnerStaysOn">{{ winsRequiredSummary }}</strong>
        <strong v-else-if="variableRacesSummary">{{ variableRacesSummary }}</strong>
        <span v-else>
            <strong v-if="bestOfSummary">{{ bestOfSummary }}</strong>
            <strong v-if="raceSummary">{{ raceSummary }}</strong>
        </span>
    </div>

    <div class="pt-2 border-top-1 border-gray-200 mb-2">
        <strong>{{ t(formatSummary) }}</strong>&nbsp;<em>({{ t(formatDetails) }}<span v-if="stagesSummary">, {{ stagesSummary }}</span>)</em>

        <span v-if="drawSummary">&nbsp;<strong>{{ drawSummary }}</strong></span>
    </div>

    <div class="pt-2 border-top-1 border-gray-200 mb-2">
        <strong>{{ t(rulesSummary) }}</strong>&nbsp;<em>({{ t(rulesDetails) }})</em>
    </div>

    <div v-if="isRoundRobin" class="pt-2 border-top-1 border-gray-200 mb-2">
        <strong>{{ t(tieBreakerSummary) }}</strong>&nbsp;<em>({{ t(tieBreakerDetails) }})</em>
    </div>
</template>
