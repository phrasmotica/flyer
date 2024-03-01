<script setup lang="ts">
import { ref } from "vue"

import CurrencyStepper from "./CurrencyStepper.vue"

import { useCurrency } from "../composables/useCurrency"
import { useSettings } from "../composables/useSettings"

import { useFlyerStore } from "../stores/flyer"

const { gbp } = useCurrency()

const flyerStore = useFlyerStore()

const { estimatedCost } = useSettings(flyerStore.settings)

const lightsCost = ref(estimatedCost)
</script>

<template>
    <div class="flex align-items-center gap-1">
        The lights cost&nbsp;
        <CurrencyStepper
            v-model="lightsCost"
            inputClass="text-center font-bold w-6rem" />
    </div>

    <p class="m-0 mt-2">
        so every player pays <strong>{{ gbp(lightsCost / flyerStore.players.length) }}</strong>
    </p>
</template>
