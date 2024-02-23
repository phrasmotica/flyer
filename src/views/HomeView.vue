<script setup lang="ts">
import { ref } from "vue"

import ConfirmModal from "../components/ConfirmModal.vue"
import FixtureList from "../components/FixtureList.vue"
import FlyerForm from "../components/FlyerForm.vue"
import ResultsTable from "../components/ResultsTable.vue"
// import RoundRobinTable from "../components/RoundRobinTable.vue"

import type { IScheduler } from "../data/IScheduler"
import { KnockoutScheduler } from "../data/KnockoutScheduler"
import { RoundRobinScheduler } from "../data/RoundRobinScheduler"

import { useFlyerStore } from "../stores/flyer"
import { usePlayersStore } from "../stores/players"
import { useSettingsStore, Format } from "../stores/settings"

enum Phase {
    Setup,
    InProgress,
    Finished,
}

enum Display {
    Fixtures = "Fixtures",
    HeadToHead = "Head-to-Head",
}

const flyerStore = useFlyerStore()
const settingsStore = useSettingsStore()
const playersStore = usePlayersStore()

const phase = ref(Phase.Setup)
const display = ref(Display.Fixtures)
const showFinishModal = ref(false)
const showRestartModal = ref(false)

const setPhase = (p: Phase) => {
    phase.value = p
    window.scroll(0, 0)
}

const start = () => {
    playersStore.init(settingsStore.actualPlayers)

    let scheduler: IScheduler

    switch (settingsStore.format) {
        case Format.Knockout:
            scheduler = new KnockoutScheduler(playersStore.players)
            break

        case Format.RoundRobin:
            scheduler = new RoundRobinScheduler(playersStore.players)
            break
    }

    flyerStore.start(scheduler.generateFixtures())

    setPhase(Phase.InProgress)
}

const confirmFinish = () => {
    showFinishModal.value = true
}

const finish = () => {
    flyerStore.finish()

    setPhase(Phase.Finished)
    hideFinishModal()
}

const hideFinishModal = () => {
    showFinishModal.value = false
}

const confirmRestart = () => {
    showRestartModal.value = true
}

const restart = () => {
    playersStore.clear()
    flyerStore.clear()

    setPhase(Phase.Setup)
    hideRestartModal()
}

const hideRestartModal = () => {
    showRestartModal.value = false
}
</script>

<template>
    <main>
        <div v-if="phase === Phase.Setup">
            <FlyerForm
                @start="start" />
        </div>

        <div v-else-if="phase === Phase.InProgress">
            <!-- <div class="p-fluid">
                <SelectButton v-model="display" :options="[Display.Fixtures, Display.HeadToHead]" :allowEmpty="false" aria-labelledby="basic" />
            </div> -->

            <FixtureList v-if="display === Display.Fixtures" />

            <!-- <RoundRobinTable v-if="display === Display.HeadToHead"
                :players="actualPlayers"
                :raceTo="raceTo"
                :rounds="rounds"
                :results="results"
                @start="startFixture"
                @updateResult="updateResult" /> -->

            <div class="p-fluid mt-2">
                <Button
                    label="Finish"
                    :disabled="!settingsStore.allowEarlyFinish && flyerStore.remainingCount > 0"
                    @click="confirmFinish" />
            </div>

            <ConfirmModal
                :visible="showFinishModal"
                header="Finish Flyer"
                message="Are you ready to finish the flyer?"
                @confirm="finish"
                @hide="hideFinishModal" />
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
                @hide="hideRestartModal" />
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
