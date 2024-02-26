<script setup lang="ts">
import { computed, ref } from "vue"
import { useRouter } from "vue-router"

import Clock from "../components/Clock.vue"
import ConfirmModal from "../components/ConfirmModal.vue"
import Podium from "../components/Podium.vue"
import ResultsTable from "../components/ResultsTable.vue"

import { Format } from "../data/FlyerSettings"

import { useFlyerStore } from "../stores/flyer"
import { useFlyerHistoryStore } from "../stores/flyerHistory"

const router = useRouter()

const flyerStore = useFlyerStore()
const flyerHistoryStore = useFlyerHistoryStore()

const showGoToSetupModal = ref(false)

const confirmGoToSetup = () => {
    if (alreadySaved.value) {
        goToSetup()
    }
    else {
        showGoToSetupModal.value = true
    }
}

const goToSetup = () => {
    flyerStore.clear()

    hideGoToSetupModal()

    router.push({
        name: "setup",
    })
}

const alreadySaved = computed(() => {
    return flyerHistoryStore.pastFlyers.some(f => f.id === flyerStore.flyer.id)
})

const saveButtonText = computed(() => alreadySaved.value ? "Flyer saved!" : "Save flyer")

const save = () => {
    if (flyerStore.flyer && !alreadySaved.value) {
        flyerHistoryStore.add(flyerStore.flyer)
    }
}

const hideGoToSetupModal = () => {
    showGoToSetupModal.value = false
}
</script>

<template>
    <main>
        <div class="flex flex-column md:flex-row justify-content-between md:align-items-end border-bottom-1 mb-1">
            <h1>{{ flyerStore.settings.name }} - Results</h1>

            <Clock :elapsedSeconds="flyerStore.durationSeconds || 0" />
        </div>

        <ResultsTable v-if="flyerStore.settings.format === Format.RoundRobin" />

        <Podium v-if="flyerStore.settings.format === Format.Knockout" />

        <ConfirmModal
            :visible="showGoToSetupModal"
            header="New flyer"
            message="Are you sure you want to start a new flyer? The current one has not been saved!"
            confirmLabel="Yes"
            :confirmDisabled="false"
            cancelLabel="No"
            @confirm="goToSetup"
            @hide="hideGoToSetupModal" />
    </main>

    <div class="sticky bottom-0 bg-colour p-fluid w-full pt-2 px-5">
        <Button class="mb-2" :label="saveButtonText" :disabled="alreadySaved" @click="save" />

        <Button class="mb-5" label="New flyer" severity="info" @click="confirmGoToSetup" />
    </div>

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
