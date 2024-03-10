<script setup lang="ts">
import { ref } from "vue"
import { useRouter } from "vue-router"

import Clock from "../components/Clock.vue"
import ConfirmModal from "../components/ConfirmModal.vue"
import FlyerForm from "../components/FlyerForm.vue"
import FlyerFormSection from "../components/FlyerFormSection.vue"
import InfoList from "../components/InfoList.vue"
import LabelledCheckbox from "../components/LabelledCheckbox.vue"
import PageTemplate from "../components/PageTemplate.vue"

import { useScreenSizes } from "../composables/useScreenSizes"
import { useSettings } from "../composables/useSettings"

import { Format } from "../data/FlyerSettings"
import { KnockoutScheduler } from "../data/KnockoutScheduler"
import { RoundRobinScheduler } from "../data/RoundRobinScheduler"
import { WinnerStaysOnScheduler } from "../data/WinnerStaysOnScheduler"

import { useFlyerStore } from "../stores/flyer"
import { useSettingsStore } from "../stores/settings"

const router = useRouter()

const flyerStore = useFlyerStore()
const settingsStore = useSettingsStore()

const { isSmallScreen } = useScreenSizes()

const {
    settings,
    isWinnerStaysOn,
    durationPerFrame,
    estimatedDuration,
    isInvalid,
} = useSettings(settingsStore.settings)

const showModal = ref(false)
const entryFeesPaid = ref(false)

const start = () => {
    switch (settings.value.format) {
        case Format.Knockout:
            flyerStore.start(settings.value, new KnockoutScheduler(settings.value.randomlyDrawAllRounds), [])
            break

        case Format.RoundRobin:
            flyerStore.start(settings.value, new RoundRobinScheduler(), [])
            break

        case Format.WinnerStaysOn:
            flyerStore.start(settings.value, new WinnerStaysOnScheduler(), [])
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
    entryFeesPaid.value = false
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
                :confirmDisabled="settings.name.length <= 0 || (settings.entryFeeRequired && !entryFeesPaid)"
                cancelLabel="Go back"
                @confirm="start"
                @hide="hideModal">
                <div class="p-fluid mb-2">
                    <InputText
                        placeholder="Flyer name"
                        v-model="settings.name" />
                </div>

                <div class="p-fluid mb-2">
                    <LabelledCheckbox
                        v-if="settings.entryFeeRequired"
                        v-model="entryFeesPaid"
                        label="Entry fees paid?" />
                </div>
            </ConfirmModal>
        </template>

        <template #buttons>
            <FlyerFormSection hidden noUnderline header="Summary">
                <div class="summary-info" :class="[isSmallScreen && 'maxh-30 overflow-y-auto']">
                    <InfoList :settings="settings" />

                    <div class="flex align-items-center justify-content-between pt-2 border-top-1 border-gray-200 mb-2">
                        <div>
                            Estimated duration <em>({{ durationPerFrame }} min(s) per frame)</em>
                        </div>

                        <div class="ml-2">
                            <Clock :elapsedSeconds="estimatedDuration * 60" />
                        </div>
                    </div>
                </div>

                <Button label="Start" :disabled="isInvalid" @click="confirmStart" />
            </FlyerFormSection>
        </template>
    </PageTemplate>
</template>

<style scoped>
.maxh-30 {
    max-height: 30vh;
}
</style>
