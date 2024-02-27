<script setup lang="ts">
import { computed } from "vue"

import type { Player } from "../data/Player"
import type { Result } from "../data/Result"

import { useFlyerStore } from "../stores/flyer"

const flyerStore = useFlyerStore()

const winner = computed(() => flyerStore.winner)

const winnerResults = computed(() => {
    if (!winner.value) {
        return []
    }

    const results = flyerStore.results.filter(r => r.scores.some(s => s.playerId === winner.value!.id))

    // ensures reverse chronological order
    return results.reverse()
})

const getScore = (result: Result) => {
    return result.scores.map(s => s.score).sort((a, b) => b - a).join("-")
}

const getOpponentName = (player: Player, result: Result) => {
    const opponentScore = result.scores.find(s => s.playerId !== player.id)
    if (!opponentScore) {
        return "UNKNOWN"
    }

    // TODO: deal with a result in which the winner got a bye

    return flyerStore.getPlayerName(opponentScore.playerId)
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
        </div>

        <ul>
            <li v-for="f in winnerResults">
                <span>
                    <span class="font-bold">{{ getScore(f) }}</span>
                    v {{ getOpponentName(winner, f) }}
                    <span class="font-italic">({{ getRoundName(f) }})</span>
                </span>
            </li>
        </ul>
    </div>

    <div v-else>
        <p class="m-0 text-center">No winner!</p>
    </div>
</template>

<style scoped>
h3 {
    margin: 0px;
}
</style>
