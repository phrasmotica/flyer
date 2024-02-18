<script setup lang="ts">
import { v4 as uuidv4 } from "uuid"
import { ref } from "vue"

import PlayersForm from "../components/PlayersForm.vue"
import ResultsSummary from "../components/ResultsSummary.vue"
import RoundRobinTable from "../components/RoundRobinTable.vue"

import type { Player } from "../models/Player"
import type { Result } from "../models/Result"

const DEFAULT_PLAYERS = ["Julian", "Roy", "Emile", "Luis", "", "", "", "", "", ""]

const phase = ref(0)
const players = ref(DEFAULT_PLAYERS)

const actualPlayers = ref<Player[]>([])
const raceTo = ref(0)
const results = ref<Result[]>([])

const setPhase = (p: number) => phase.value = p

const setName = (index: number, name: string) => {
    players.value = players.value.map((v, i) => i === index ? name : v)
}

const start = (players: string[], r: number) => {
    actualPlayers.value = players.map(p => ({
        id: uuidv4(),
        name: p,
    }))

    raceTo.value = r
    setPhase(1)
}

const addResult = (result: Result) => {
    results.value = [...results.value, result]
}

const restart = () => {
    setPhase(0)
    actualPlayers.value = []
    raceTo.value = 0
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
            <RoundRobinTable :players="actualPlayers" :raceTo="raceTo" :results="results" @addResult="addResult" />

            <div class="p-fluid mt-2">
                <Button label="Finish" @click="() => setPhase(2)" />
            </div>
        </div>

        <div v-else-if="phase === 2">
            <ResultsSummary :players="actualPlayers" :results="results" />

            <div class="p-fluid mt-2">
                <Button label="Restart" @click="restart" />
            </div>
        </div>
    </main>
</template>

<style scoped>
main {
    min-width: 600px;
}
</style>
