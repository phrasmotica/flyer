<script setup lang="ts">
import { v4 as uuidv4 } from "uuid"
import { computed, ref } from "vue"

import FixtureList from "../components/FixtureList.vue"
import FlyerForm from "../components/FlyerForm.vue"
import ResultsTable from "../components/ResultsTable.vue"
import RoundRobinTable from "../components/RoundRobinTable.vue"

import { RoundRobinScheduler, type Round } from "../data/RoundRobinScheduler"

import type { Player } from "../models/Player"
import type { Result } from "../models/Result"

enum Phase {
    Setup,
    InProgress,
    Finished,
}

enum Display {
    Fixtures = "Fixtures",
    HeadToHead = "Head-to-Head",
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

// TODO: use this to assign fixtures to tables
const tableCount = ref(0)

const rounds = ref<Round[]>([])
const results = computed(() => rounds.value.flatMap(r => r.fixtures))

const display = ref(Display.Fixtures)

const setPhase = (p: Phase) => phase.value = p

const setName = (index: number, name: string) => {
    players.value = players.value.map((v, i) => i === index ? name : v)
}

const start = (players: string[], r: number, t: number) => {
    actualPlayers.value = players.map(p => ({
        id: uuidv4(),
        name: p,
    }))

    raceTo.value = r
    tableCount.value = t
    rounds.value = new RoundRobinScheduler(actualPlayers.value).generateFixtures()
    setPhase(Phase.InProgress)
}

const startFixture = (id: string) => {
    rounds.value = rounds.value.map(r => r.startFixture(id))
}

const updateResult = (newResult: Result, finish: boolean) => {
    rounds.value = rounds.value.map(r => r.updateResult(newResult, finish))
}

const restart = () => {
    setPhase(Phase.Setup)
    actualPlayers.value = []
    raceTo.value = 0
    rounds.value = []
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
                <SelectButton v-model="display" :options="[Display.Fixtures, Display.HeadToHead]" :allowEmpty="false" aria-labelledby="basic" />
            </div>

            <FixtureList v-if="display === Display.Fixtures"
                :players="actualPlayers"
                :raceTo="raceTo"
                :rounds="rounds"
                @start="startFixture"
                @updateResult="updateResult" />

            <RoundRobinTable v-if="display === Display.HeadToHead" :players="actualPlayers" :raceTo="raceTo" :results="results" @updateResult="updateResult" />

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
../data/RoundRobinScheduler
