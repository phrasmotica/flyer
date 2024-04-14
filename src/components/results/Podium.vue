<script setup lang="ts">
import { useI18n } from "vue-i18n"

import MatchText from "./MatchText.vue"
import WinnerWinnings from "./WinnerWinnings.vue"

import { useFlyer } from "@/composables/useFlyer"
import { usePodium } from "@/composables/usePodium"

import { useFlyerStore } from "@/stores/flyer"

const { t } = useI18n()

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
        <WinnerWinnings :winner="winner" :winnings="moneyRecipients[0]" />

        <ul class="m-0">
            <li v-for="f in winnerFixtures">
                <MatchText :playerId="winner.id" :fixture="f" />
            </li>
        </ul>
    </div>

    <div v-else>
        <Message class="m-0" :closable="false">
            {{ t('podium.noWinner') }}
        </Message>
    </div>
</template>
