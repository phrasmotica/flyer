<script setup lang="ts">
import { useI18n } from "vue-i18n"

import { useQueryParams } from "@/composables/useQueryParams"

import type { Player } from "@/data/Player"

const props = defineProps<{
    header?: string
    winnings: {
        colour: string,
        player: Player,
        winnings: number,
    }[]
}>()

const { n, t } = useI18n()

const {
    isHistoric,
} = useQueryParams()

const getMessage = (name: string) => {
    const key = isHistoric.value ? 'results.winningsMessageHistoric' : 'results.winningsMessage'
    return t(key, { name })
}
</script>

<template>
    <div>
        <p v-if="props.header" class="m-0">{{ props.header }}</p>

        <p v-for="w in props.winnings" class="m-0">
            <!-- HIGH: create a component for this, and use it in WinningsSummary too -->
            <span>{{ getMessage(w.player.name) }}</span>

            <span class="font-bold" :style="{color: w.colour,}">
                {{ n(w.winnings, "currency") }}
            </span>
        </p>
    </div>
</template>
