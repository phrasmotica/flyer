<script setup lang="ts">
import { onUpdated } from "vue"
import { v4 as uuidv4 } from "uuid"

import { useTweaks } from "../composables/useTweaks"

const value = defineModel<number>()

// TODO: allow providing a different currency
const props = defineProps<{
    inputId?: string
    min?: number
    max?: number
    step?: number
    suffix?: string
}>()

const { blurNumberInputs } = useTweaks()

const id = "currency-stepper-" + uuidv4()

onUpdated(() => {
    blurNumberInputs(id)
})
</script>

<template>
    <InputNumber
        :id="id"
        v-model="value"
        showButtons buttonLayout="horizontal"
        :min="props.min || 0" :max="props.max || 100" :step="props.step || 0.5"
        mode="currency" currency="GBP" locale="en-GB"
        :suffix="props.suffix"
        :inputId="props.inputId"
        inputClass="text-center font-bold">
        <template #incrementbuttonicon>
            <span class="pi pi-plus" />
        </template>
        <template #decrementbuttonicon>
            <span class="pi pi-minus" />
        </template>
    </InputNumber>
</template>
