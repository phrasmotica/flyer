<script setup lang="ts">
import { computed } from "vue"
import { useI18n } from "vue-i18n"
import type { MeterItem } from "primevue/metergroup"

import { usePrizes } from "@/composables/usePrizes"

import type { Specification } from "@/data/Specification"

const props = defineProps<{
    settings: Specification
    playerCount: number
}>()

const { n, t } = useI18n()

const {
    prizePot,
    prizeMoniesMeterItems,
} = usePrizes(props.settings, props.playerCount)

const localisedMeterItems = computed<MeterItem[]>(() => prizeMoniesMeterItems.value.map((mi, i, items) => {
    // e.g. if we are the first quarter-finalist so far, this will return 1.
    // Then if we are the second quarter finalist it will return 2, etc.
    const labelNumber = items.slice(0, i).filter(i => i.label === mi.label).length + 1

    return ({
        ...mi,
        label: t(mi.label, labelNumber),
    })
}))
</script>

<template>
    <div class="flex justify-content-between">
        <span class="text-lg font-bold">{{ t("prizePot.totalPrizePot") }}</span>
        <span class="text-lg font-bold">{{ n(prizePot, "currency") }}</span>
    </div>

    <MeterGroup
        class="gap-1"
        :value="localisedMeterItems"
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
