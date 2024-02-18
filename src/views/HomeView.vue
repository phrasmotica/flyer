<script setup lang="ts">
import { v4 as uuidv4 } from "uuid"
import { ref } from "vue"

import FlyerForm from "../components/FlyerForm.vue"
import ResultsTable from "../components/ResultsTable.vue"
import RoundRobinTable from "../components/RoundRobinTable.vue"

import type { Player } from "../models/Player"
import type { Result } from "../models/Result"

enum Phase {
    Setup,
    InProgress,
    Finished,
}

const defaultPlayersEnv = import.meta.env.VITE_DEFAULT_PLAYERS

let defaultPlayers = <string[]>[]
if (defaultPlayersEnv) {
    defaultPlayers = String(defaultPlayersEnv).split(";")
}

if (defaultPlayers.length < 10) {
    defaultPlayers = [...defaultPlayers, ...new Array(10 - defaultPlayers.length).fill("")]
}

const phase = ref(Phase.Setup)
const players = ref(defaultPlayers)

const actualPlayers = ref<Player[]>([])
const raceTo = ref(0)
const results = ref<Result[]>([])

const setPhase = (p: Phase) => phase.value = p

const setName = (index: number, name: string) => {
    players.value = players.value.map((v, i) => i === index ? name : v)
}

const start = (players: string[], r: number) => {
    actualPlayers.value = players.map(p => ({
        id: uuidv4(),
        name: p,
    }))

    raceTo.value = r
    setPhase(Phase.InProgress)
}

const getExistingResult = (result: Result) => {
    const newPlayerIds = result.scores.map(s => s.playerId)

    return results.value.findIndex(r => {
        const playerIds = r.scores.map(s => s.playerId)
        return playerIds.length === newPlayerIds.length
            && playerIds.every(id => newPlayerIds.includes(id))
    })
}

const addResult = (newResult: Result) => {
    const existingResultIndex = getExistingResult(newResult)
    if (existingResultIndex >= 0) {
        results.value = results.value.map((r, i) => i === existingResultIndex ? newResult : r)
    }
    else {
        results.value = [...results.value, newResult]
    }
}

const restart = () => {
    setPhase(Phase.Setup)
    actualPlayers.value = []
    raceTo.value = 0
    results.value = []
}
</script>

<template>
    <main>
        <div v-if="phase === Phase.Setup">
            <FlyerForm
                :players="players"
                @setName="setName"
                @start="start" />
        </div>

        <div v-else-if="phase === Phase.InProgress">
            <RoundRobinTable :players="actualPlayers" :raceTo="raceTo" :results="results" @addResult="addResult" />

            <div class="p-fluid mt-2">
                <Button label="Finish" @click="() => setPhase(Phase.Finished)" />
            </div>
        </div>

        <div v-else-if="phase === Phase.Finished">
            <ResultsTable :players="actualPlayers" :results="results" />

            <div class="p-fluid mt-2">
                <Button label="Restart" @click="restart" />
            </div>
        </div>
    </main>
</template>

<style scoped>
@media screen and (max-width: 767px) {
    main {
        width: 100%;
    }
}

@media screen and (min-width: 768px) {
    main {
        width: 600px;
    }
}
</style>
