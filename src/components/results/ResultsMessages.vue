<script setup lang="ts">
import { computed } from "vue"

import IncompleteResultsMessage from "./IncompleteResultsMessage.vue"
import TieBreakerMessages from "./TieBreakerMessages.vue"

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
    incompleteCount,
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

const showTieBreakerMessages = computed(() => {
    return tieBreakers.value.length > 0 && !isWinnerStaysOn.value
})
</script>

<template>
    <div>
        <div v-if="showIncompleteMessage">
            <IncompleteResultsMessage />
        </div>

        <div v-if="showTieBreakerMessages" class="mt-1">
            <TieBreakerMessages />
        </div>
    </div>
</template>
