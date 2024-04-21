<script setup lang="ts">
import { computed } from "vue"

import IncompleteResultsMessage from "./IncompleteResultsMessage.vue"
import PlayOffsRequiredMessage from "./PlayOffsRequiredMessage.vue"
import TieBreakerMessages from "./TieBreakerMessages.vue"
import WinningsSummary from "./WinningsSummary.vue"

import { useFlyer } from "@/composables/useFlyer"
import { usePhaseSettings } from "@/composables/usePhaseSettings"

import { useFlyerStore } from "@/stores/flyer"

const props = defineProps<{
    isInProgress?: boolean
}>()

const flyerStore = useFlyerStore()

const {
    mainPhase,
    tieBreakers,
    allPlayOffsComplete,
    incompleteCount,
    isFinished,
} = useFlyer(flyerStore.flyer)

const {
    isWinnerStaysOn,
} = usePhaseSettings(mainPhase.value)

const showIncompleteMessage = computed(() => {
    if (props.isInProgress) {
        return false
    }

    return incompleteCount.value > 0 && !isWinnerStaysOn.value
})

const showPlayOffsRequiredMessage = computed(() => {
    if (props.isInProgress) {
        return false
    }

    return !allPlayOffsComplete.value && tieBreakers.value.length > 0
})

const showTieBreakerMessages = computed(() => {
    return tieBreakers.value.length > 0 && !isWinnerStaysOn.value
})

const showWinningsSummary = computed(() => isFinished.value)
</script>

<template>
    <div>
        <div v-if="showIncompleteMessage">
            <IncompleteResultsMessage />
        </div>

        <div v-if="showPlayOffsRequiredMessage" class="mt-1">
            <PlayOffsRequiredMessage />
        </div>

        <div v-if="showTieBreakerMessages" class="mt-1">
            <TieBreakerMessages />
        </div>

        <div v-if="showWinningsSummary" class="mt-1">
            <WinningsSummary />
        </div>
    </div>
</template>
