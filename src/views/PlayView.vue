<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref } from "vue"
import { useRouter } from "vue-router"
import type { MenuItem } from "primevue/menuitem"

import Clock from "../components/Clock.vue"
import ConfirmModal from "../components/ConfirmModal.vue"
import FixtureList from "../components/FixtureList.vue"
import PageTemplate from "../components/PageTemplate.vue"
import PrizePotSummary from "../components/PrizePotSummary.vue"
import ResultsTable from "../components/ResultsTable.vue"

import { useFlyer } from "../composables/useFlyer"
import { useSettings } from "../composables/useSettings"

import { useFlyerStore } from "../stores/flyer"

enum Display {
    Fixtures = "Fixtures",
    Standings = "Standings",
}

const router = useRouter()

const flyerStore = useFlyerStore()

const {
    elapsedSeconds,
    durationSeconds,
    hasStarted,
    hasFinished,
    isInProgress,
    isComplete,
    readyForNextRound,
    pauseClock,
    resumeClock,
} = useFlyer(flyerStore.flyer)

const {
    settings,
    formatSummary,
    drawSummary,
    raceSummary,
    rulesSummary,
} = useSettings(flyerStore.settings)

const display = ref(Display.Fixtures)

const showFinishModal = ref(false)
const showInfoModal = ref(false)
const showAbandonModal = ref(false)

const items = ref<MenuItem[]>([
    {
        icon: 'pi pi-calendar',
        command: _ => display.value = Display.Fixtures,
    },
    {
        icon: 'pi pi-chart-bar',
        command: _ => display.value = Display.Standings,
    },
])

onMounted(() => {
    if (isInProgress.value) {
        resumeClock()
    }
})

const clockDisplay = computed(() => durationSeconds.value || elapsedSeconds.value)

const finishButtonText = computed(() => {
    if (hasStarted.value && hasFinished.value) {
        return "View results"
    }

    return "Finish"
})

const generateNextRound = () => {
    flyerStore.generateNextRound()
}

const confirmFinish = () => {
    if (hasFinished.value) {
        finish()
    }
    else {
        showFinishModal.value = true
    }
}

const finish = () => {
    flyerStore.finish()

    hideFinishModal()

    router.push({
        name: "results",
    })
}

const hideFinishModal = () => {
    showFinishModal.value = false
}

const hideInfoModal = () => showInfoModal.value = false

const abandon = () => {
    flyerStore.clear()

    hideAbandonModal()

    router.push({
        name: "setup",
    })
}

const hideAbandonModal = () => showAbandonModal.value = false

onUnmounted(() => {
    pauseClock()
})
</script>

<template>
    <PageTemplate>
        <template #content>
            <div class="flex align-items-baseline justify-content-between border-bottom-1 mb-1">
                <h1>{{ settings.name }}</h1>

                <Clock :elapsedSeconds="clockDisplay" />
            </div>

            <TabMenu class="mb-2" :model="items" />

            <FixtureList v-if="display === Display.Fixtures" />

            <ResultsTable v-if="display === Display.Standings" isInProgress />

            <ConfirmModal
                :visible="showFinishModal"
                header="Finish Flyer"
                message="Are you ready to finish the flyer?"
                confirmLabel="Yes"
                :confirmDisabled="false"
                cancelLabel="No"
                @confirm="finish"
                @hide="hideFinishModal" />

            <Dialog
                modal
                class="mx-4"
                v-model:visible="showInfoModal"
                :header="settings.name + ' - Info'"
                @hide="hideInfoModal">
                <div class="p-fluid mb-2">
                    <h4 class="font-bold">Rules</h4>

                    <ul class="m-0">
                        <li>
                            {{ formatSummary }}
                            <span v-if="drawSummary">
                                <em>({{ drawSummary }})</em>
                            </span>
                        </li>
                        <li>{{ raceSummary }}</li>
                        <li>{{ rulesSummary }}</li>
                    </ul>
                </div>

                <div v-if="settings.entryFeeRequired" class="p-fluid mb-2">
                    <PrizePotSummary :settings="flyerStore.settings" />
                </div>

                <div class="p-fluid">
                    <Button
                        type="button"
                        label="Close"
                        severity="secondary"
                        @click="hideInfoModal" />
                </div>
            </Dialog>

            <ConfirmModal
                :visible="showAbandonModal"
                header="Abandon flyer"
                message="Are you sure you want to abandon this flyer?"
                confirmLabel="Yes"
                :confirmDisabled="false"
                cancelLabel="No"
                @confirm="abandon"
                @hide="hideAbandonModal" />
        </template>

        <template #buttons>
            <Button
                v-if="settings.randomlyDrawAllRounds && !flyerStore.generationIsComplete"
                class="mb-2"
                label="Generate next round"
                :disabled="!readyForNextRound"
                @click="generateNextRound" />

            <Button
                v-else
                class="mb-2"
                :label="finishButtonText"
                :disabled="!settings.allowEarlyFinish && flyerStore.remainingCount > 0"
                @click="confirmFinish" />

            <Button
                class="mb-2"
                label="Info"
                severity="info"
                @click="() => showInfoModal = true" />

            <Button
                v-if="!hasFinished"
                class="mb-2"
                label="Abandon"
                severity="danger"
                @click="() => showAbandonModal = true" />
        </template>
    </PageTemplate>
</template>
