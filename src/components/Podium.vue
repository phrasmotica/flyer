<script setup lang="ts">
import VictoryText from "./VictoryText.vue"

import { useCurrency } from "../composables/useCurrency"
import { usePodium } from "../composables/usePodium"

import { useFlyerStore } from "../stores/flyer"

const { gbp } = useCurrency()

const flyerStore = useFlyerStore()

const {
    winner,
    winnerResults,
    moneyRecipients,
} = usePodium(flyerStore.flyer)
</script>

<template>
    <div v-if="winner">
        <div class="text-center">
            <p class="m-0">The winner is</p>
            <h1 class="font-bold">{{ winner.name }}</h1>

            <p v-if="moneyRecipients.length > 0" class="m-0 text-xl">
                who wins
                <span class="font-bold">
                    {{ gbp(moneyRecipients[0].winnings) }}
                </span>
            </p>
        </div>

        <ul class="m-0">
            <li v-for="f in winnerResults">
                <VictoryText :result="f" />
            </li>
        </ul>

        <div v-if="moneyRecipients.length > 1" class="border-top-1 mt-1 pt-1">
            <p class="m-0">Other prize money:</p>

            <p v-for="l in moneyRecipients.slice(1)" class="m-0">
                {{ l.player.name }} wins
                <span class="font-bold">
                    {{ gbp(l.winnings) }}
                </span>
            </p>
        </div>
    </div>

    <div v-else>
        <p class="m-0 text-center">No winner!</p>
    </div>
</template>
