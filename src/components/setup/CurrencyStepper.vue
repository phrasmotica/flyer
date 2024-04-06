<script setup lang="ts">
import { computed, onUpdated } from "vue"
import { useI18n } from "vue-i18n"
import { v4 as uuidv4 } from "uuid"

import { useTweaks } from "@/composables/useTweaks"

const value = defineModel<number>()

const props = defineProps<{
    inputId?: string
    min?: number
    max?: number
    step?: number
    suffix?: string
}>()

const { locale, numberFormats } = useI18n()

const currency = computed(() => {
    const currentLocale = numberFormats.value[locale.value]
    if (currentLocale) {
        return currentLocale.currency.currency
    }

    return "GBP"
})

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
        mode="currency" :currency="currency" :locale="locale"
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
