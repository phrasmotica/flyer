<script setup lang="ts">
import { v4 as uuidv4 } from "uuid"
import { computed, onUpdated } from "vue"
import { useI18n } from "vue-i18n"

import { useScreenSizes } from "@/composables/useScreenSizes"
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

const {
    isSmallScreen,
} = useScreenSizes()

const currency = computed(() => {
    const currentLocale = numberFormats.value[locale.value]
    if (currentLocale) {
        return currentLocale.currency.currency
    }

    return "GBP"
})

const { blurNumberInputs } = useTweaks()

const id = "currency-stepper-" + uuidv4()

const inputClass = computed(() => {
    let c = "text-center font-bold"

    if (isSmallScreen.value) {
        c += " text-sm"
    }

    return c
})

onUpdated(() => {
    blurNumberInputs(id)
})
</script>

<template>
    <div class="flex justify-content-center">
        <!-- we provide a nominal narrow width to the inputStyle, so that
        the flex-grow: 1 in the style block will always activate -->
        <InputNumber
            :id="id"
            v-model="value"
            showButtons buttonLayout="horizontal"
            :min="props.min || 0" :max="props.max || 100" :step="props.step || 0.5"
            mode="currency" :currency="currency" :locale="locale"
            :suffix="props.suffix"
            :inputId="props.inputId"
            :inputClass="inputClass"
            :inputStyle="{ width: '100px' }">
            <template #incrementbuttonicon>
                <span class="pi pi-plus" />
            </template>
            <template #decrementbuttonicon>
                <span class="pi pi-minus" />
            </template>
        </InputNumber>
    </div>
</template>

<style>
.p-inputnumber {
    flex-grow: 1;
}
</style>
