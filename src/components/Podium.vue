<script setup lang="ts">
import VictoryText from "./VictoryText.vue"

import { useCurrency } from "../composables/useCurrency"
import { useFlyer } from "../composables/useFlyer"
import { useSettings } from "../composables/useSettings"

import type { Player } from "../data/Player"
import type { Result } from "../data/Result"

import { useFlyerStore } from "../stores/flyer"

const { gbp } = useCurrency()

const flyerStore = useFlyerStore()

const {
    settings,
    winner,
    winnerResults,
    getPlayerName,
} = useFlyer(flyerStore.flyer)

const {
    prizeMonies,
} = useSettings(settings.value)

const getOpponentName = (player: Player, result: Result) => {
    const opponentScore = result.scores.find(s => s.playerId !== player.id)
    if (!opponentScore) {
        return "UNKNOWN"
    }

    return getPlayerName(opponentScore.playerId)
}
</script>

<template>
    <div v-if="winner">
        <div class="text-center">
            <p class="m-0">The winner is</p>
            <h1 class="font-bold">{{ winner.name }}</h1>

            <p v-if="prizeMonies.length > 0" class="m-0 text-xl">
                who wins
                <span class="font-bold">
                    {{ gbp(prizeMonies[0]) }}
                </span>
            </p>
        </div>

        <ul class="m-0">
            <li v-for="f in winnerResults">
                <VictoryText :result="f" />
            </li>
        </ul>

        <div v-if="prizeMonies.length > 1" class="border-top-1 mt-1 pt-1">
            <p class="m-0">Other prize money:</p>

            <!-- TODO: show prize monies for ALL other recipients, creating a component for it -->
            <p class="m-0">
                {{ getOpponentName(winner, winnerResults[0]) }} wins
                <span class="font-bold">
                    {{ gbp(prizeMonies[1]) }}
                </span>
            </p>
        </div>
    </div>

    <div v-else>
        <p class="m-0 text-center">No winner!</p>
    </div>
</template>
