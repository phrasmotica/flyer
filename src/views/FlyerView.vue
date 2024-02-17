<script setup lang="ts">
import { ref } from "vue"

import PlayersForm from "../components/PlayersForm.vue"
import ResultsSummary from "../components/ResultsSummary.vue"
import ResultsTable from "../components/ResultsTable.vue"

import type { Result } from "../models/Result"

const phase = ref(0)
const players = ref<string[]>([])
const results = ref<Result[]>([])

const setPhase = (p: number) => phase.value = p

const start = (p: string[]) => {
    players.value = p
    setPhase(1)
}

const addResult = (player1: string, player2: string) => {
    results.value = [...results.value, {
        scores: [
            {
                player: player1,
                score: 1,
            },
            {
                player: player2,
                score: 0,
            },
        ]
    }]
}

const restart = () => {
    setPhase(0)
    results.value = []
}
</script>

<template>
    <main>
        <div v-if="phase === 0">
            <PlayersForm @start="start" />
        </div>

        <div v-else-if="phase === 1">
            <ResultsTable :players="players" :results="results" @addResult="addResult" />

            <button class="btn btn-primary w-100" @click="() => setPhase(2)">Finish</button>
        </div>

        <div v-else-if="phase === 2">
            <ResultsSummary :players="players" :results="results" />

            <button class="btn btn-primary w-100" @click="restart">Restart</button>
        </div>
    </main>
</template>

<style scoped>
main {
    width: 600px;
}
</style>
