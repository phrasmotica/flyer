<script setup lang="ts">
import { useI18n } from "vue-i18n"

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
</script>

<template>
    <p v-if="props.header" class="m-0">{{ props.header }}</p>

    <p v-for="w in props.winnings" class="m-0">
        {{ w.player.name }} wins
        <span class="font-bold" :style="{color: w.colour,}">
            {{ n(w.winnings, "currency") }}
        </span>
    </p>
</template>
