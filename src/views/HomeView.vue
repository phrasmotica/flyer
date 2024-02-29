<script setup lang="ts">
import { ref } from "vue"
import { useRouter } from "vue-router"

import Clock from "../components/Clock.vue"
import ConfirmModal from "../components/ConfirmModal.vue"
import FlyerForm from "../components/FlyerForm.vue"
import PageTemplate from "../components/PageTemplate.vue"
import PrizePotSummary from "../components/PrizePotSummary.vue"

import { useSettings } from "../composables/useSettings"

import { Format } from "../data/FlyerSettings"
import { KnockoutScheduler } from "../data/KnockoutScheduler"
import { RoundRobinScheduler } from "../data/RoundRobinScheduler"

import { useFlyerStore } from "../stores/flyer"
import { useSettingsStore } from "../stores/settings"

const router = useRouter()

const flyerStore = useFlyerStore()
const settingsStore = useSettingsStore()

const {
    settings,
} = useSettings(settingsStore.settings)

const showModal = ref(false)

const start = () => {
    switch (settings.value.format) {
        case Format.Knockout:
            flyerStore.start(settings.value, new KnockoutScheduler(settings.value.randomlyDrawAllRounds))
            break

        case Format.RoundRobin:
            flyerStore.start(settings.value, new RoundRobinScheduler())
            break

        default:
            throw `Invalid flyer format ${settings.value.format}!`
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
    <PageTemplate>
        <template #content>
            <div class="flex align-items-center justify-content-between border-bottom-1 mb-2">
                <h1>New Flyer</h1>

                <Button icon="pi pi-history" severity="info" @click="viewPastFlyers" />
            </div>

            <FlyerForm />

            <ConfirmModal
                :visible="showModal"
                header="Start Flyer"
                message="Please enter a name for the flyer:"
                confirmLabel="Start"
                :confirmDisabled="settings.name.length <= 0"
                cancelLabel="Go back"
                @confirm="start"
                @hide="hideModal">
                <div class="p-fluid mb-2">
                    <InputText
                        placeholder="Flyer name"
                        v-model="settings.name" />
                </div>
            </ConfirmModal>
        </template>

        <template #buttons>
            <div class="flex align-items-center justify-content-between pb-1 border-bottom-1 border-gray-200 mb-2">
                <div>
                    Estimated duration <em>({{ settingsStore.durationPerFrame }} min(s) per frame)</em>
                </div>

                <div class="ml-4">
                    <Clock large :elapsedSeconds="settingsStore.estimatedDuration * 60" />
                </div>
            </div>

            <div v-if="settings.entryFeeRequired"
                class="p-fluid border-bottom-1 border-gray-200 mb-2">
                <PrizePotSummary :settings="settingsStore.settings" />
            </div>

            <Button label="Start" :disabled="settingsStore.isInvalid" @click="confirmStart" />
        </template>
    </PageTemplate>
</template>
