<script setup lang="ts">
import { ref } from "vue"
import { useRouter } from "vue-router"

import ConfirmModal from "../components/ConfirmModal.vue"
import Podium from "../components/Podium.vue"
import ResultsTable from "../components/ResultsTable.vue"

import { Format } from "../data/FlyerSettings"

import { useFlyerStore } from "../stores/flyer"
import { useFlyerHistoryStore } from "../stores/flyerHistory"

const router = useRouter()

const flyerStore = useFlyerStore()
const flyerHistoryStore = useFlyerHistoryStore()

const showRestartModal = ref(false)

const confirmRestart = () => {
    showRestartModal.value = true
}

const restart = () => {
    flyerStore.clear()

    hideRestartModal()

    router.push({
        name: "setup",
    })
}

const save = () => {
    if (flyerStore.flyer) {
        flyerHistoryStore.add(flyerStore.flyer)
    }
}

const hideRestartModal = () => {
    showRestartModal.value = false
}
</script>

<template>
    <main>
        <ResultsTable v-if="flyerStore.settings.format === Format.RoundRobin" />

        <Podium v-if="flyerStore.settings.format === Format.Knockout" />

        <div class="p-fluid mt-2">
            <Button class="mb-2" label="Save flyer" severity="info" @click="save" />

            <Button label="Restart" @click="confirmRestart" />
        </div>

        <ConfirmModal
            :visible="showRestartModal"
            header="Restart"
            message="Are you sure you want to restart? All data for the current flyer will be lost!"
            confirmLabel="Yes"
            :confirmDisabled="false"
            cancelLabel="No"
            @confirm="restart"
            @hide="hideRestartModal" />
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
