<script setup lang="ts">
import { ref } from "vue"

import { useCurrency } from "../composables/useCurrency"

import { useFlyerStore } from "../stores/flyer"

const { gbp } = useCurrency()

const flyerStore = useFlyerStore()

const lightsCost = ref(flyerStore.costEstimate)
</script>

<template>
    <div class="flex align-items-center gap-1">
        The lights cost&nbsp;
        <InputNumber
            showButtons
            buttonLayout="horizontal"
            :min="0" :step="0.5"
            v-model="lightsCost"
            mode="currency"
            currency="GBP"
            locale="en-GB"
            inputClass="w-6rem" />
    </div>

    <p class="m-0 mt-2">
        so every player pays <strong>{{ gbp(lightsCost / flyerStore.players.length) }}</strong>
    </p>
</template>
