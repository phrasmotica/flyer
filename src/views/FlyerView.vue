<script setup lang="ts">
import { ref } from "vue"

import PlayersForm from "../components/PlayersForm.vue"
import ResultsSummary from "../components/ResultsSummary.vue"
import ResultsTable from "../components/ResultsTable.vue"

import type { Result } from "../models/Result"

const DEFAULT_PLAYERS = ["Julian", "Roy", "Emile", "Luis", "", "", "", "", "", ""]

const phase = ref(0)
const players = ref(DEFAULT_PLAYERS)

const actualPlayers = ref<string[]>([])
const results = ref<Result[]>([])

const setPhase = (p: number) => phase.value = p

const setName = (index: number, name: string) => {
    players.value = players.value.map((v, i) => i === index ? name : v)
}

const start = (p: string[]) => {
    actualPlayers.value = p
    setPhase(1)
}

const addResult = (result: Result) => {
    results.value = [...results.value, result]
}

const restart = () => {
    setPhase(0)
    actualPlayers.value = []
    results.value = []
}
</script>

<template>
    <main>
        <div v-if="phase === 0">
            <PlayersForm
                :players="players"
                @setName="setName"
                @start="start" />
        </div>

        <div v-else-if="phase === 1">
            <ResultsTable :players="actualPlayers" :results="results" @addResult="addResult" />

            <button class="btn btn-primary w-100" @click="() => setPhase(2)">Finish</button>
        </div>

        <div v-else-if="phase === 2">
            <ResultsSummary :players="actualPlayers" :results="results" />

            <button class="btn btn-primary w-100" @click="restart">Restart</button>
        </div>
    </main>
</template>

<style scoped>
main {
    min-width: 600px;
}
</style>
