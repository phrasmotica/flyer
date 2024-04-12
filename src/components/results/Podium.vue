<script setup lang="ts">
import { useI18n } from "vue-i18n"

import VictoryText from "./VictoryText.vue"

import { useFlyer } from "@/composables/useFlyer"
import { usePodium } from "@/composables/usePodium"

import { useFlyerStore } from "@/stores/flyer"

const { n, t } = useI18n()

const flyerStore = useFlyerStore()

const {
    mainPhase,
} = useFlyer(flyerStore.flyer)

const {
    winner,
    winnerFixtures,
    moneyRecipients,
} = usePodium(mainPhase.value)
</script>

<template>
    <div v-if="winner">
        <!-- HIGH: create a component for this and use it in WinningsSummary also -->
        <div class="text-center">
            <p class="m-0">{{ t('podium.theWinnerIs') }}</p>

            <p class="m-0 text-4xl font-bold">
                {{ winner.name }}
            </p>

            <p v-if="moneyRecipients.length > 0" class="m-0 text-xl">
                {{ t('podium.whoWins') }}

                <span class="font-bold" :style="{color: moneyRecipients[0].colour,}">
                    {{ n(moneyRecipients[0].amount, "currency") }}
                </span>
            </p>
        </div>

        <ul class="m-0">
            <li v-for="f in winnerFixtures">
                <VictoryText :fixture="f" />
            </li>
        </ul>
    </div>

    <div v-else>
        <Message class="m-0" :closable="false">
            {{ t('podium.noWinner') }}
        </Message>
    </div>
</template>
