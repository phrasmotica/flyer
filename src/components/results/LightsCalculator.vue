<script setup lang="ts">
import { ref } from "vue"
import { useI18n } from "vue-i18n"

import CurrencyStepper from "../setup/CurrencyStepper.vue"

import { useFlyer } from "@/composables/useFlyer"
import { usePhase } from "@/composables/usePhase"
import { usePlayers } from "@/composables/usePlayers"

import { useFlyerStore } from "@/stores/flyer"

const { n, t } = useI18n()

const flyerStore = useFlyerStore()

const {
    mainPhase,
} = useFlyer(flyerStore.flyer)

const {
    totalCost,
} = usePhase(mainPhase.value)

const {
    players,
} = usePlayers(mainPhase.value)

const lightsCost = ref(totalCost.value)
</script>

<template>
    <div class="flex align-items-center gap-1">
        {{ t('results.theLightsCost') }}

        <CurrencyStepper
            v-model="lightsCost"
            inputClass="text-center font-bold w-6rem" />
    </div>

    <p class="m-0 mt-2">
        {{ t('results.soEveryPlayerPays') }}

        <span class="font-bold">
            {{ n(lightsCost / players.length, "currency") }}
        </span>
    </p>
</template>
