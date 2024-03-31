<script setup lang="ts">
import { computed } from "vue"

import { usePhaseSettings } from "../composables/usePhaseSettings"

import type { PhaseSettings } from "../data/PhaseSettings"
import type { Round } from "../data/Round"

const props = defineProps<{
    settings: PhaseSettings
    rounds: Round[]
}>()

const {
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
} = usePhaseSettings(props.settings)

const variableRacesSummary = computed(() => {
    if (isFixedMatchLength.value) {
        return ""
    }

    return "Races to " + props.rounds
        .map(r => `${r.raceTo} (${r.name})`)
        .join(", then ")
})
</script>

<template>
    <div v-if="isWinnerStaysOn" class="mb-2">
        <strong>{{ winsRequiredSummary }}</strong>
    </div>

    <div v-else-if="variableRacesSummary" class="mb-2">
        <strong>{{ variableRacesSummary }}</strong>
    </div>

    <div v-else-if="raceSummary" class="mb-2">
        <strong>{{ raceSummary }}</strong>
    </div>

    <div class="pt-2 border-top-1 border-gray-200 mb-2">
        <strong>{{ formatSummary }}</strong>&nbsp;<em>({{ formatDetails }})</em>
        <span v-if="drawSummary">&nbsp;via a <strong>{{ drawSummary }}</strong></span>
    </div>

    <div class="pt-2 border-top-1 border-gray-200 mb-2">
        <strong>{{ rulesSummary }}</strong>&nbsp;<em>({{ rulesDetails }})</em>
    </div>

    <div v-if="isRoundRobin" class="pt-2 border-top-1 border-gray-200 mb-2">
        <strong>{{ tieBreakerSummary }}</strong>&nbsp;<em>({{ tieBreakerDetails }})</em>
    </div>
</template>
