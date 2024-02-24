<script setup lang="ts">
import { ref } from "vue"
import { useRouter } from "vue-router"

import ConfirmModal from "../components/ConfirmModal.vue"
import FlyerForm from "../components/FlyerForm.vue"

import { Format } from "../data/FlyerSettings"
import { KnockoutScheduler } from "../data/KnockoutScheduler"
import { RoundRobinScheduler } from "../data/RoundRobinScheduler"

import { useFlyerStore } from "../stores/flyer"
import { useSettingsStore } from "../stores/settings"

const router = useRouter()

const flyerStore = useFlyerStore()
const settingsStore = useSettingsStore()

const showModal = ref(false)

const start = () => {
    switch (settingsStore.settings.format) {
        case Format.Knockout:
            flyerStore.start(settingsStore.actualPlayers, settingsStore.settings, new KnockoutScheduler())
            break

        case Format.RoundRobin:
            flyerStore.start(settingsStore.actualPlayers, settingsStore.settings, new RoundRobinScheduler())
            break

        default:
            throw `Invalid flyer format ${settingsStore.settings.format}!`
    }

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
