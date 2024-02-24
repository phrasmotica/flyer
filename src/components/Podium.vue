<script setup lang="ts">
import { computed } from "vue"

import { useFlyerStore } from "../stores/flyer"
import type { Result } from "@/data/Result"

const flyerStore = useFlyerStore()

const winner = computed(() => flyerStore.winner)

const winnerResults = computed(() => {
    const results = flyerStore.results.filter(r => r.scores.some(s => s.playerId === winner.value?.id || "???"))

    // ensures reverse chronological order
    return results.reverse()
})

const getScore = (result: Result) => {
    return result.scores.map(s => s.score).sort((a, b) => b - a).join("-")
}

const getOpponentName = (result: Result) => {
    return flyerStore.getPlayerName(result.scores.find(s => s.playerId !== winner.value!.id)!.playerId)
}

const getRoundName = (result: Result) => {
    const round = flyerStore.rounds.find(r => r.fixtures.some(f => f.id === result.id))
    return round?.name ?? "UNKNOWN"
}
</script>

<template>
    <h1 class="border-bottom-1">Results</h1>

    <p>Took {{ flyerStore.durationMinutes }} minute(s)</p>

    <div v-if="winner">
        <div class="text-center">
            <p>The winner is</p>
            <h1 class="font-bold">{{ winner.name }}</h1>
        </div>

        <ul>
            <li v-for="f in winnerResults">
                <span>
                    <span class="font-bold">{{ getScore(f) }}</span>
                    v {{ getOpponentName(f) }}
                    <span class="font-italic">({{ getRoundName(f) }})</span>
                </span>
            </li>
        </ul>
    </div>

    <div v-else>
        <p class="text-center">No winner!</p>
    </div>
</template>

<style scoped>
h3 {
    margin: 0px;
}
</style>
