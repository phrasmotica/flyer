<script setup lang="ts">
import { useI18n } from "vue-i18n"

import type { Player } from "@/data/Player"
import type { Winnings } from "@/data/Winnings"

const { n, t } = useI18n()

const props = defineProps<{
    winner: Player
    winnings?: Winnings
}>()
</script>

<template>
    <div class="text-center">
        <p class="m-0">{{ t('podium.theWinnerIs') }}</p>

        <p class="m-0 text-4xl font-bold">
            {{ props.winner.name }}
        </p>

        <p v-if="props.winnings" class="m-0 text-xl">
            {{ t('podium.whoWins') }}

            <span class="font-bold" :style="{color: props.winnings.colour,}">
                {{ n(props.winnings.amount || 0, "currency") }}
            </span>
        </p>
    </div>
</template>
