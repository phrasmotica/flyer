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
    prizeMoniesSummary,
} = useSettings(props.settings)
</script>

<template>
    <div class="flex justify-content-between">
        <h4 class="font-bold">Total prize pot</h4>
        <h4 class="font-bold">{{ prizePotSummary }}</h4>
    </div>

    <MeterGroup
        class="gap-0"
        :value="prizeMoniesMeterItems"
        :max="prizePot">
        <template #label>
            <div class="flex justify-content-between">
                <span>
                    {{ prizeMoniesSummary }}
                </span>
            </div>
        </template>
    </MeterGroup>
</template>
