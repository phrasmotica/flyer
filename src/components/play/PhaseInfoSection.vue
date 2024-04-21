<script setup lang="ts">
import InfoList from "../setup/InfoList.vue"
import PrizePotSummary from "../setup/PrizePotSummary.vue"

import { useFlyer } from "@/composables/useFlyer"
import { usePlayers } from "@/composables/usePlayers"
import { useRounds } from "@/composables/useRounds"
import { usePhaseSpecification } from "@/composables/useSpecification"
import { useTables } from "@/composables/useTables"

import { useFlyerStore } from "@/stores/flyer"

const flyerStore = useFlyerStore()

const {
    currentPhase,
} = useFlyer(flyerStore.flyer)

const {
    players,
} = usePlayers(currentPhase.value)

const {
    raceTos,
} = useRounds(currentPhase.value)

const {
    settings,
} = usePhaseSpecification(currentPhase.value)

const {
    tables,
} = useTables(currentPhase.value)
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
