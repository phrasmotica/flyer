<script setup lang="ts">
import { v4 as uuidv4 } from "uuid"
import { ref } from "vue"

import FixtureList from "../components/FixtureList.vue"
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

enum Display {
    Table = "Table",
    List = "List",
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

const display = ref(Display.Table)

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
    results.value = generateFixtures(actualPlayers.value)
    setPhase(Phase.InProgress)
}

const generateFixtures = (players: Player[]) => {
    const fixtures = new Scheduler(players).generateFixtures()

    return fixtures
}

const updateResult = (newResult: Result) => {
    const existingResultIndex = results.value.findIndex(r => r.id === newResult.id)
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
            <div class="p-fluid">
                <SelectButton v-model="display" :options="[Display.Table, Display.List]" :allowEmpty="false" aria-labelledby="basic" />
            </div>

            <RoundRobinTable v-if="display === Display.Table" :players="actualPlayers" :raceTo="raceTo" :results="results" @updateResult="updateResult" />

            <FixtureList v-if="display === Display.List" :players="actualPlayers" :raceTo="raceTo" :results="results" @updateResult="updateResult" />

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

    <footer>
        <a href="https://www.flaticon.com/free-icons/ball-eight" title="ball eight icons">Ball eight icons created by Boris farias - Flaticon</a>
    </footer>
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
