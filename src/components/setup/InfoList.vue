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
    drawSummary,
    raceSummary,
    winsRequiredSummary,
    rulesSummary,
    rulesDetails,
    tieBreakerSummary,
    tieBreakerDetails,
    isRoundRobin,
    isWinnerStaysOn,
    isFixedMatchLength,
} = usePhaseSettingsInternal(props.settings)

const variableRacesSummary = computed(() => {
    if (isFixedMatchLength.value) {
        return ""
    }

    return "Races to " + props.raceTos
        .map(r => `${r.raceTo!} (${r.name})`)
        .join(", then ")
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
        <strong>{{ props.playerCount }} players</strong>
    </div>

    <div class="pt-2 border-top-1 border-gray-200 mb-2">
        <strong v-if="props.tableCount > 1">{{ props.tableCount }} tables</strong>
        <strong v-else>{{ props.tableCount }} table</strong>
    </div>

    <div class="pt-2 border-top-1 border-gray-200 mb-2">
        <strong v-if="isWinnerStaysOn">{{ winsRequiredSummary }}</strong>
        <strong v-else-if="variableRacesSummary">{{ variableRacesSummary }}</strong>
        <strong v-else-if="raceSummary">{{ raceSummary }}</strong>
    </div>

    <div class="pt-2 border-top-1 border-gray-200 mb-2">
        <strong>{{ t(formatSummary) }}</strong>&nbsp;<em>({{ t(formatDetails) }}<span v-if="stagesSummary">, {{ stagesSummary }}</span>)</em>

        <span v-if="drawSummary">&nbsp;via a <strong>{{ drawSummary }}</strong></span>
    </div>

    <div class="pt-2 border-top-1 border-gray-200 mb-2">
        <strong>{{ t(rulesSummary) }}</strong>&nbsp;<em>({{ t(rulesDetails) }})</em>
    </div>

    <div v-if="isRoundRobin" class="pt-2 border-top-1 border-gray-200 mb-2">
        <strong>{{ t(tieBreakerSummary) }}</strong>&nbsp;<em>({{ t(tieBreakerDetails) }})</em>
    </div>
</template>
