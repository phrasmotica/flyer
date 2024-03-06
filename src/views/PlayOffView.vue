<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref } from "vue"
import { useRouter } from "vue-router"
import type { MenuItem } from "primevue/menuitem"

import Clock from "../components/Clock.vue"
import ConfirmModal from "../components/ConfirmModal.vue"
import FixtureList from "../components/FixtureList.vue"
import InfoList from "../components/InfoList.vue"
import PageTemplate from "../components/PageTemplate.vue"
import ResultsTable from "../components/ResultsTable.vue"

import { useFlyer } from "../composables/useFlyer"

import { useFlyerStore, usePlayOffStore } from "../stores/flyer"

// HIGH: de-duplicate this
enum Display {
    Fixtures = "Fixtures",
    Standings = "Standings",
    Info = "Info",
}

const router = useRouter()

const flyerStore = useFlyerStore()
const playOffStore = usePlayOffStore()

const {
    settings: flyerSettings,
} = useFlyer(flyerStore.flyer)

const {
    flyer: playOffFlyer,
    settings,
    clockDisplay,
    hasStarted,
    hasFinished,
    isInProgress,
    remainingCount,
    pauseClock,
    resumeClock,
} = useFlyer(playOffStore.flyer)

const display = ref(Display.Fixtures)

const showFinishModal = ref(false)

const items = ref<MenuItem[]>([
    {
        icon: 'pi pi-calendar',
        command: _ => display.value = Display.Fixtures,
    },
    {
        icon: 'pi pi-chart-bar',
        command: _ => display.value = Display.Standings,
    },
    {
        icon: 'pi pi-info-circle',
        command: _ => display.value = Display.Info,
    },
])

onMounted(() => {
    if (isInProgress.value) {
        resumeClock()
    }
})

const finishButtonText = computed(() => {
    if (hasStarted.value && hasFinished.value) {
        return "View results"
    }

    return "Finish"
})

const confirmFinish = () => {
    if (hasFinished.value) {
        finish()
    }
    else {
        showFinishModal.value = true
    }
}

const finish = () => {
    const success = playOffStore.finish()
    if (!success) {
        throw "Failed to finish play-off!"
    }

    flyerStore.addPlayOff(playOffFlyer.value!)

    playOffStore.clear()

    hideFinishModal()

    router.push({
        name: "results",
    })
}

const hideFinishModal = () => {
    showFinishModal.value = false
}

onUnmounted(() => {
    pauseClock()
})
</script>

<template>
    <PageTemplate>
        <template #content>
            <div class="flex align-items-baseline justify-content-between border-bottom-1 mb-1">
                <h1>{{ flyerSettings.name }}: {{ settings.name }}</h1>

                <Clock :elapsedSeconds="clockDisplay" />
            </div>

            <TabMenu class="mb-2" :model="items" />

            <FixtureList v-if="display === Display.Fixtures" isPlayOff />

            <ResultsTable v-if="display === Display.Standings" isPlayOff isInProgress />

            <InfoList v-if="display === Display.Info" :settings="settings" />

            <ConfirmModal
                :visible="showFinishModal"
                header="Finish Play-Off"
                message="Are you ready to finish the play-off?"
                confirmLabel="Yes"
                :confirmDisabled="false"
                cancelLabel="No"
                @confirm="finish"
                @hide="hideFinishModal" />
        </template>

        <template #buttons>
            <Button
                class="mb-2"
                :label="finishButtonText"
                :disabled="!settings.allowEarlyFinish && remainingCount > 0"
                @click="confirmFinish" />
        </template>
    </PageTemplate>
</template>
