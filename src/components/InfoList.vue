<script setup lang="ts">
import PrizePotSummary from "./PrizePotSummary.vue"

import { useSettings } from "../composables/useSettings"

import { type FlyerSettings } from "../data/FlyerSettings"

const props = defineProps<{
    settings: FlyerSettings
}>()

const {
    settings,
    formatSummary,
    formatDetails,
    drawSummary,
    raceSummary,
    rulesSummary,
    rulesDetails,
    tieBreakerSummary,
    tieBreakerDetails,
    isRoundRobin,
} = useSettings(props.settings)
</script>

<template>
    <div class="mb-2">
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

    <div v-if="settings.entryFeeRequired" class="pt-2 border-top-1 border-gray-200 mb-2">
        <PrizePotSummary :settings="settings" />
    </div>
</template>
