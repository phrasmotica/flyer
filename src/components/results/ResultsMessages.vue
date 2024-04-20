<script setup lang="ts">
import { computed } from "vue"

import IncompleteResultsMessage from "./IncompleteResultsMessage.vue"
import PlayOffsRequiredMessage from "./PlayOffsRequiredMessage.vue"
import TiesBrokenMessage from "./TiesBrokenMessage.vue"
import WinningsSummary from "./WinningsSummary.vue"

import { useFlyer } from "@/composables/useFlyer"
import { usePhaseSettings } from "@/composables/usePhaseSettings"
import { useStandings } from "@/composables/useStandings"

import { useFlyerStore } from "@/stores/flyer"

const props = defineProps<{
    isInProgress?: boolean
}>()

const flyerStore = useFlyerStore()

const {
    mainPhase,
    playOffs,
    allPlayOffsComplete,
    incompleteCount,
} = useFlyer(flyerStore.flyer)

const {
    isWinnerStaysOn,
} = usePhaseSettings(mainPhase.value)

const {
    requiresPlayOff,
    standings,
} = useStandings(mainPhase.value)

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

const showWinningsSummary = computed(() => {
    if (props.isInProgress) {
        return false
    }

    return !requiresPlayOff.value || allPlayOffsComplete.value
})

const inseparablePlayers = computed(() => {
    const recordsToConsider = standings.value.filter(s => !s.tieBroken)
    const playerIds = recordsToConsider.map(s => s.playerId)
    const playersInPlayOffs = playOffs.value.flatMap(p => p.players).map(p => p.id)
    return playerIds.filter(x => playersInPlayOffs.includes(x))
})
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
            <TiesBrokenMessage
                :inseparablePlayers="inseparablePlayers" />
        </div>

        <div v-if="showWinningsSummary" class="mt-1">
            <WinningsSummary />
        </div>
    </div>
</template>
