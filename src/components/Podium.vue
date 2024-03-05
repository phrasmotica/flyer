<script setup lang="ts">
import { computed } from "vue"

import { useCurrency } from "../composables/useCurrency"
import { useFlyer } from "../composables/useFlyer"
import { useSettings } from "../composables/useSettings"

import type { Player } from "../data/Player"
import type { Result } from "../data/Result"

import { useFlyerStore } from "../stores/flyer"

const { gbp } = useCurrency()

const flyerStore = useFlyerStore()

const {
    getPlayerName,
} = useFlyer(flyerStore.flyer)

const {
    prizeMonies,
} = useSettings(flyerStore.settings)

const winner = computed(() => flyerStore.winner)

const winnerResults = computed(() => {
    if (!winner.value) {
        return []
    }

    const results = flyerStore.results.filter(r => r.scores.some(s => s.playerId === winner.value!.id))

    // ensures reverse chronological order
    return results.reverse()
})

const isWalkover = (result: Result) => result.scores.some(s => s.isBye)

const getScore = (result: Result) => {
    if (isWalkover(result)) {
        return "W/O"
    }

    return result.scores.map(s => s.score).sort((a, b) => b - a).join("-")
}

const getOpponentName = (player: Player, result: Result) => {
    const opponentScore = result.scores.find(s => s.playerId !== player.id)
    if (!opponentScore) {
        return "UNKNOWN"
    }

    return getPlayerName(opponentScore.playerId)
}

const getRoundName = (result: Result) => {
    const round = flyerStore.rounds.find(r => r.fixtures.some(f => f.id === result.id))
    return round?.name || "UNKNOWN"
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
                <span>
                    <span class="font-bold">{{ getScore(f) }}</span>
                    <span v-if="!isWalkover(f)">&nbsp;v {{ getOpponentName(winner, f) }}</span>
                    <span class="font-italic">&nbsp;({{ getRoundName(f) }})</span>
                </span>
            </li>
        </ul>

        <div v-if="prizeMonies.length > 1" class="border-top-1 mt-1 pt-1">
            <p class="m-0">Other prize money:</p>

            <!-- TODO: show prize monies for ALL other recipients -->
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
