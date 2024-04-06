<script setup lang="ts">
import { ref } from "vue"
import { useI18n } from "vue-i18n"

import CurrencyStepper from "../setup/CurrencyStepper.vue"

import { useFlyer } from "@/composables/useFlyer"
import { usePhase } from "@/composables/usePhase"

import { useFlyerStore } from "@/stores/flyer"

const { n } = useI18n()

const flyerStore = useFlyerStore()

const {
    mainPhase,
} = useFlyer(flyerStore.flyer)

const {
    players,
    totalCost,
} = usePhase(mainPhase.value)

const lightsCost = ref(totalCost.value)
</script>

<template>
    <div class="flex align-items-center gap-1">
        The lights cost&nbsp;
        <CurrencyStepper
            v-model="lightsCost"
            inputClass="text-center font-bold w-6rem" />
    </div>

    <p class="m-0 mt-2">
        so every player pays <strong>{{ n(lightsCost / players.length, "currency") }}</strong>
    </p>
</template>
