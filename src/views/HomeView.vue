<script setup lang="ts">
import { ref } from "vue"
import { useRouter } from "vue-router"

import Clock from "../components/Clock.vue"
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
            flyerStore.start(settingsStore.settings, new KnockoutScheduler(settingsStore.settings.randomlyDrawAllRounds))
            break

        case Format.RoundRobin:
            flyerStore.start(settingsStore.settings, new RoundRobinScheduler())
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

const viewPastFlyers = () => {
    router.push({
        name: "history",
    })
}

const hideModal = () => {
    showModal.value = false
}
</script>

<template>
    <main>
        <h1 class="border-bottom-1 mb-2">New Flyer</h1>

        <FlyerForm />

        <ConfirmModal
            :visible="showModal"
            header="Start Flyer"
            message="Please enter a name for the flyer:"
            confirmLabel="Start"
            :confirmDisabled="settingsStore.settings.name.length <= 0"
            cancelLabel="Go back"
            @confirm="start"
            @hide="hideModal">
            <div class="p-fluid mb-2">
                <InputText
                    placeholder="Flyer name"
                    v-model="settingsStore.settings.name" />
            </div>
        </ConfirmModal>
    </main>

    <div class="nav-buttons sticky bottom-0 bg-colour p-fluid w-full pt-2 px-5">
        <div class="flex align-items-center justify-content-between border-bottom-1 border-gray-200 mb-2">
            <div>
                Estimated duration <em>({{ settingsStore.durationPerFrame }} min(s) per frame)</em>
            </div>

            <div class="ml-4">
                <Clock large :elapsedSeconds="settingsStore.estimatedDuration * 60" />
            </div>
        </div>

        <div v-if="settingsStore.settings.entryFeeRequired"
            class="flex align-items-center justify-content-between border-bottom-1 border-gray-200 mb-2">
            <div>
                Total prize pot <em>({{ settingsStore.settings.playerCount }} players)</em>
            </div>

            <div class="ml-4">
                <p class="m-0 text-center font-bold text-3xl">
                    &pound;{{ settingsStore.settings.playerCount * settingsStore.settings.entryFee }}
                </p>
            </div>
        </div>

        <Button class="mb-2" label="Start" :disabled="settingsStore.isInvalid" @click="confirmStart" />

        <Button class="mb-2" label="View past flyers" severity="info" @click="viewPastFlyers" />
    </div>
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
