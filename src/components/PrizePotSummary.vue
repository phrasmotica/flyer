<script setup lang="ts">
import { useI18n } from "vue-i18n"

import { useSettings } from "../composables/useSettings"

import type { FlyerSettings } from "../data/FlyerSettings"

const props = defineProps<{
    settings: FlyerSettings
}>()

const { n } = useI18n()

const {
    prizePot,
    prizeMoniesMeterItems,
} = useSettings(props.settings)
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
                    <span class="text-sm font-italic">{{ n(v.value, "currency") }}</span>
                </div>
            </div>
        </template>
    </MeterGroup>
</template>
