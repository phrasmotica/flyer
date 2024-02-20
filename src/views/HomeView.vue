<script setup lang="ts">
import { ref } from "vue"

import ConfirmModal from "../components/ConfirmModal.vue"
import FixtureList from "../components/FixtureList.vue"
import FlyerForm from "../components/FlyerForm.vue"
import ResultsTable from "../components/ResultsTable.vue"
// import RoundRobinTable from "../components/RoundRobinTable.vue"

import { RoundRobinScheduler } from "../data/RoundRobinScheduler"

import { usePlayersStore } from "../stores/players"
import { useRoundsStore } from "../stores/rounds"

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

const playersStore = usePlayersStore()
const raceTo = ref(0)

// TODO: use this to assign fixtures to tables
const tableCount = ref(0)

let scheduler: RoundRobinScheduler

const roundsStore = useRoundsStore()

const display = ref(Display.Fixtures)
const showFinishModal = ref(false)
const showRestartModal = ref(false)

const setPhase = (p: Phase) => phase.value = p

const setName = (index: number, name: string) => {
    players.value = players.value.map((v, i) => i === index ? name : v)
}

const start = (players: string[], r: number, t: number) => {
    playersStore.init(players)

    raceTo.value = r
    tableCount.value = t

    scheduler = new RoundRobinScheduler(playersStore.players)
    roundsStore.setRounds(scheduler.generateFixtures())

    setPhase(Phase.InProgress)
}

const confirmFinish = () => {
    showFinishModal.value = true
}

const finish = () => {
    setPhase(Phase.Finished)
    hideModal()
}

const hideModal = () => {
    showFinishModal.value = false
}

const confirmRestart = () => {
    showRestartModal.value = true
}

const restart = () => {
    setPhase(Phase.Setup)
    playersStore.clear()
    raceTo.value = 0
    roundsStore.clear()
}

const hideRestartModal = () => {
    showRestartModal.value = false
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
            <!-- <div class="p-fluid">
                <SelectButton v-model="display" :options="[Display.Fixtures, Display.HeadToHead]" :allowEmpty="false" aria-labelledby="basic" />
            </div> -->

            <FixtureList v-if="display === Display.Fixtures"
                :raceTo="raceTo" />

            <!-- <RoundRobinTable v-if="display === Display.HeadToHead"
                :players="actualPlayers"
                :raceTo="raceTo"
                :rounds="rounds"
                :results="results"
                @start="startFixture"
                @updateResult="updateResult" /> -->

            <div class="p-fluid mt-2">
                <Button label="Finish" @click="confirmFinish" />
            </div>

            <ConfirmModal
                :visible="showFinishModal"
                header="Finish Flyer"
                message="Are you ready to finish the flyer?"
                @confirm="finish"
                @cancel="hideModal" />
        </div>

        <div v-else-if="phase === Phase.Finished">
            <ResultsTable />

            <div class="p-fluid mt-2">
                <Button label="Restart" @click="confirmRestart" />
            </div>

            <ConfirmModal
                :visible="showRestartModal"
                header="Restart"
                message="Are you sure you want to restart? All data for the current flyer will be lost!"
                @confirm="restart"
                @cancel="hideRestartModal" />
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
