<script setup lang="ts">
import { useI18n } from "vue-i18n"

import { useQueryParams } from "../composables/useQueryParams"

import type { Player } from "../data/Player"

const props = defineProps<{
    header?: string
    winnings: {
        colour: string,
        player: Player,
        winnings: number,
    }[]
}>()

const { n } = useI18n()

const {
    isHistoric,
} = useQueryParams()
</script>

<template>
    <div>
        <p v-if="props.header" class="m-0">{{ props.header }}</p>

        <p v-for="w in props.winnings" class="m-0">
            <span v-if="isHistoric">{{ w.player.name }} won&nbsp;</span>
            <span v-else>{{ w.player.name }} wins&nbsp;</span>

            <span class="font-bold" :style="{color: w.colour,}">
                {{ n(w.winnings, "currency") }}
            </span>
        </p>
    </div>
</template>
