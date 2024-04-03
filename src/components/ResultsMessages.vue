<script setup lang="ts">
import { computed } from "vue"

import IncompleteResultsMessage from "./IncompleteResultsMessage.vue"
import PlayOffsRequiredMessage from "./PlayOffsRequiredMessage.vue"
import TiesBrokenMessage from "./TiesBrokenMessage.vue"
import WinningsSummary from "./WinningsSummary.vue"

import { useFlyer } from "../composables/useFlyer"
import { usePhase } from "../composables/usePhase"
import { usePhaseSettings } from "../composables/usePhaseSettings"
import { useStandings } from "../composables/useStandings"

import { useFlyerStore } from "../stores/flyer"

const flyerStore = useFlyerStore()

const {
    mainPhase,
    playOffs,
    allPlayOffsComplete,
    incompleteCount,
} = useFlyer(flyerStore.flyer)

const {
    settings,
} = usePhase(mainPhase.value)

const {
    isWinnerStaysOn,
} = usePhaseSettings(settings.value)

const {
    requiresPlayOff,
} = useStandings(mainPhase.value)

const showIncompleteMessage = computed(() => incompleteCount.value > 0 && !isWinnerStaysOn.value)

const showPlayOffsRequiredMessage = computed(() => {
    if (!requiresPlayOff.value) {
        return false
    }

    return !allPlayOffsComplete.value && playOffs.value.length > 0
})

const showTiesBrokenMessage = computed(() => {
    if (requiresPlayOff.value) {
        return false
    }

    return playOffs.value.length > 0 && !isWinnerStaysOn.value
})

const showWinningsSummary = computed(() => !requiresPlayOff.value || allPlayOffsComplete.value)
</script>

<template>
    <div>
        <div v-if="showIncompleteMessage">
            <IncompleteResultsMessage />
        </div>

        <div v-if="showPlayOffsRequiredMessage" class="mt-1">
            <PlayOffsRequiredMessage />
        </div>

        <div v-if="showTiesBrokenMessage" class="mt-1">
            <TiesBrokenMessage />
        </div>

        <div v-if="showWinningsSummary" class="mt-1">
            <WinningsSummary />
        </div>
    </div>
</template>
