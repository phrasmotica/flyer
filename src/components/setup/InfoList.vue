<script setup lang="ts">
import { computed } from "vue"
import { useI18n } from "vue-i18n"

import { useSpecification } from "@/composables/usePhaseSettings"

import type { Specification } from "@/data/Specification"

const { t } = useI18n()

const props = defineProps<{
    settings: Specification
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
} = useSpecification(props.settings)

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

    return props.raceTos
        .map(r => t('races.roundToN', {
            round: r.name,
            n: r.raceTo!,
        }))
        .join(", ")
})

const drawSummary = computed(() => {
    if (!isKnockout.value) {
        return ""
    }

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
        <div v-if="isWinnerStaysOn" class="font-bold">
            {{ winsRequiredSummary }}
        </div>
        <div v-else-if="variableRacesSummary">
            <div class="font-bold">{{ t('races.variableRaces') }}</div>
            <div>{{ variableRacesSummary }}</div>
        </div>
        <div v-else class="font-bold">
            <span v-if="bestOfSummary">{{ bestOfSummary }}</span>
            <span v-if="raceSummary">{{ raceSummary }}</span>
        </div>
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
