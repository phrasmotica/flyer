<script setup lang="ts">
import { useSettings } from "../composables/useSettings"

import type { FlyerSettings } from "../data/FlyerSettings"

const props = defineProps<{
    settings: FlyerSettings
}>()

const {
    prizePot,
    prizePotSummary,
    prizeMoniesMeterItems,
} = useSettings(props.settings)
</script>

<template>
    <div class="flex justify-content-between">
        <span class="text-lg font-bold">Total prize pot</span>
        <span class="text-lg font-bold">{{ prizePotSummary }}</span>
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
                    <span class="text-sm font-italic">&pound;{{ v.value }}</span>
                </div>
            </div>
        </template>
    </MeterGroup>
</template>
