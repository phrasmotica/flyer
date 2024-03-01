<script setup lang="ts">
import { ref } from "vue"

import { useFlyerStore } from "../stores/flyer"

const flyerStore = useFlyerStore()

const lightsCost = ref(flyerStore.costEstimate)

// TODO: put this in a composable
const gbp = new Intl.NumberFormat('en-GB', {
    style: 'currency',
    currency: 'GBP',
})
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
        so every player pays <strong>{{ gbp.format(lightsCost / flyerStore.players.length) }}</strong>
    </p>
</template>
