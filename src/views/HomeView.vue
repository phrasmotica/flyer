<script setup lang="ts">
import { ref } from "vue"
import { useRouter } from "vue-router"

import ConfirmModal from "../components/ConfirmModal.vue"
import FlyerForm from "../components/FlyerForm.vue"

import type { IScheduler } from "../data/IScheduler"
import { KnockoutScheduler } from "../data/KnockoutScheduler"
import { RoundRobinScheduler } from "../data/RoundRobinScheduler"

import { useFlyerStore } from "../stores/flyer"
import { usePlayersStore } from "../stores/players"
import { useSettingsStore, Format } from "../stores/settings"

const router = useRouter()

const flyerStore = useFlyerStore()
const settingsStore = useSettingsStore()
const playersStore = usePlayersStore()

const showModal = ref(false)

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

        default:
            throw `Invalid flyer format ${settingsStore.format}!`
    }

    flyerStore.start(scheduler.generateFixtures())

    hideModal()

    router.push({
        name: "play",
    })
}

const confirmStart = () => {
    showModal.value = true
}

const hideModal = () => {
    showModal.value = false
}
</script>

<template>
    <main>
        <FlyerForm />

        <div class="p-fluid">
            <Button label="Start" :disabled="settingsStore.isInvalid" @click="confirmStart" />
        </div>

        <ConfirmModal
            :visible="showModal"
            header="Start Flyer"
            message="Are you ready to start the flyer?"
            @confirm="start"
            @hide="hideModal" />
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
