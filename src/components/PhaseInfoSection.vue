<script setup lang="ts">
import InfoList from "./InfoList.vue"
import PrizePotSummary from "./PrizePotSummary.vue"

import { useFlyer } from "../composables/useFlyer"
import { usePhase } from "../composables/usePhase"

import { useFlyerStore } from "../stores/flyer"

const flyerStore = useFlyerStore()

const {
    currentPhase,
} = useFlyer(flyerStore.flyer)

const {
    settings,
    players,
    tables,
    raceTos,
} = usePhase(currentPhase.value)
</script>

<template>
    <div>
        <InfoList
            :settings="settings"
            :playerCount="players.length"
            :tableCount="tables.length"
            :raceTos="raceTos" />

        <div
            v-if="settings.entryFeeRequired"
            class="pt-2 border-top-1 border-gray-200 mb-2">
            <PrizePotSummary :settings="settings" :playerCount="players.length" />
        </div>
    </div>
</template>
