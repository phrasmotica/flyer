<script setup lang="ts">
import { useSettings } from "../composables/useSettings"

import { useFlyerStore } from "../stores/flyer"

const flyerStore = useFlyerStore()

const {
    settings,
    formatSummary,
    formatDetails,
    drawSummary,
    raceSummary,
    rulesSummary,
    rulesDetails,
} = useSettings(flyerStore.settings)
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

    <div v-if="settings.entryFeeRequired" class="pt-2 border-top-1 border-gray-200 mb-2">
        <PrizePotSummary :settings="flyerStore.settings" />
    </div>
</template>
