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
import { useQueryParams } from "../composables/useQueryParams"

import { useFlyerStore } from "../stores/flyer"

enum Display {
    Fixtures,
    Standings,
    Info,
}

const router = useRouter()

const flyerStore = useFlyerStore()

const {
    settings,
    clockDisplay,
    hasStarted,
    hasFinished,
    isInProgress,
    remainingCount,
    nextRound,
    generationIsComplete,
    readyForNextRound,
    pauseClock,
    resumeClock,
} = useFlyer(flyerStore.flyer)

const {
    queryParams,
    isHistoric,
} = useQueryParams()

const display = ref(Display.Fixtures)

const showFinishModal = ref(false)
const showAbandonModal = ref(false)

const items = computed(() => {
    const defaultItems = <MenuItem[]>[
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
    ]

    if (isHistoric.value) {
        defaultItems.splice(1, 1)
    }

    return defaultItems
})

onMounted(() => {
    if (isInProgress.value) {
        resumeClock()
    }
})

const generateNextRoundLabel = computed(() => {
    if (nextRound.value) {
        return "Generate " + nextRound.value.name
    }

    return "Generate next round"
})

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
    const success = flyerStore.finish()
    if (!success) {
        throw "Failed to finish flyer!"
    }

    hideFinishModal()

    router.push({
        name: "results",
        query: queryParams.value,
    })
}

const hideFinishModal = () => {
    showFinishModal.value = false
}

const abandon = () => {
    flyerStore.clear()

    hideAbandonModal()

    router.push({
        name: "setup",
    })
}

const hideAbandonModal = () => showAbandonModal.value = false

const goToPastFlyers = () => {
    router.push({
        name: "history",
    })
}

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

            <InfoList v-if="display === Display.Info" :settings="settings" />

            <ConfirmModal
                :visible="showFinishModal"
                header="Finish Flyer"
                message="Are you ready to finish the flyer?"
                confirmLabel="Yes"
                :confirmDisabled="false"
                cancelLabel="No"
                @confirm="finish"
                @hide="hideFinishModal" />

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
                v-if="!isHistoric && settings.randomlyDrawAllRounds && !generationIsComplete"
                class="mb-2"
                :label="generateNextRoundLabel"
                :disabled="!readyForNextRound"
                @click="generateNextRound" />

            <Button
                v-else
                class="mb-2"
                :label="finishButtonText"
                :disabled="!settings.allowEarlyFinish && remainingCount > 0"
                @click="confirmFinish" />

            <Button
                v-if="!hasFinished"
                class="mb-2"
                label="Abandon"
                severity="danger"
                @click="() => showAbandonModal = true" />

            <Button
                v-if="isHistoric"
                class="mb-2"
                label="Back to past flyers"
                severity="info"
                @click="goToPastFlyers" />
        </template>
    </PageTemplate>
</template>
