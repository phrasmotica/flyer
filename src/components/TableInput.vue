<script setup lang="ts">
import CurrencyStepper from "./CurrencyStepper.vue"
import NameInput from "./NameInput.vue"

const newTableName = defineModel<string>("name")
const newTableCost = defineModel<number>("cost")

const props = defineProps<{
    compact?: boolean
}>()
</script>

<template>
    <NameInput
        :class="!props.compact && 'mb-2'"
        v-model="newTableName"
        placeholder="Table name" />

    <CurrencyStepper
        :class="props.compact ? 'mt-1' : 'mb-2'"
        inputId="newTableCostPerHourStepper"
        v-model="newTableCost"
        suffix=" per hour" />
</template>