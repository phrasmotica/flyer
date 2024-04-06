<script setup lang="ts">
import { onUpdated } from "vue"
import { v4 as uuidv4 } from "uuid"

import { useTweaks } from "@/composables/useTweaks"

const value = defineModel<number>()

const props = defineProps<{
    inputId?: string
    min?: number
    max?: number
    step?: number
    prefix?: string
    suffix?: string
}>()

const { blurNumberInputs } = useTweaks()

const id = "stepper-" + uuidv4()

onUpdated(() => {
    blurNumberInputs(id)
})
</script>

<template>
    <InputNumber
        :id="id"
        v-model="value"
        showButtons buttonLayout="horizontal"
        :min="props.min || 0" :max="props.max || 100" :step="props.step || 1"
        :prefix="props.prefix"
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
