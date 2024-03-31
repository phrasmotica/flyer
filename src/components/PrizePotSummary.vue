<script setup lang="ts">
import { useI18n } from "vue-i18n"

import { usePrizes } from "../composables/usePrizes"

import type { PhaseSettings } from "../data/PhaseSettings"

const props = defineProps<{
    settings: PhaseSettings
    playerCount: number
}>()

const { n } = useI18n()

const {
    prizePot,
    prizeMoniesMeterItems,
} = usePrizes(props.settings, props.playerCount)
</script>

<template>
    <div class="flex justify-content-between">
        <span class="text-lg font-bold">Total prize pot</span>
        <span class="text-lg font-bold">{{ n(prizePot, "currency") }}</span>
    </div>

    <MeterGroup
        class="gap-1"
        :value="prizeMoniesMeterItems"
        :max="prizePot"
        labelPosition="start">
        <template #label="x">
            <div v-for="v in x.value">
                <div class="flex justify-content-between">
                    <span class="text-sm font-italic">{{ v.label }}</span>
                    <span class="text-sm font-italic font-bold" :style="{ color: v.color }">
                        {{ n(v.value, "currency") }}
                    </span>
                </div>
            </div>
        </template>
    </MeterGroup>
</template>
