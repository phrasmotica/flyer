<script setup lang="ts">
import { useI18n } from "vue-i18n"

import type { Winnings } from "@/data/Winnings"

const { n, t } = useI18n()

const props = defineProps<{
    winnings: Winnings
}>()
</script>

<template>
    <div class="text-center">
        <p class="m-0">{{ t('podium.theWinnerIs') }}</p>

        <p class="m-0 text-4xl font-bold">
            {{ props.winnings.player.name }}
        </p>

        <p class="m-0 text-xl">
            {{ t('podium.whoWins') }}

            <span class="font-bold" :style="{color: props.winnings.colour,}">
                {{ n(props.winnings.amount, "currency") }}
            </span>
        </p>
    </div>
</template>
