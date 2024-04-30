<script setup lang="ts">
import { computed } from "vue"

import IncompleteResultsMessage from "./IncompleteResultsMessage.vue"
import TieBreakerMessages from "./TieBreakerMessages.vue"

import { useFlyer } from "@/composables/useFlyer"
import { usePhaseSpecification } from "@/composables/useSpecification"

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
} = usePhaseSpecification(mainPhase.value)

const showIncompleteMessage = computed(() => {
    if (props.isInProgress) {
        return false
    }

    return incompleteCount.value > 0 && !isWinnerStaysOn.value
})

const showTieBreakerMessages = computed(() => tieBreakers.value.length > 0)
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
