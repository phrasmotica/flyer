<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref } from "vue"
import { useToggle } from "@vueuse/core"
import { useRouter } from "vue-router"
import type { MenuItem } from "primevue/menuitem"

import Clock from "../components/Clock.vue"
import ConfirmModal from "../components/ConfirmModal.vue"
import FixtureList from "../components/FixtureList.vue"
import InfoList from "../components/InfoList.vue"
import PageTemplate from "../components/PageTemplate.vue"
import Price from "../components/Price.vue"
import ResultsTable from "../components/ResultsTable.vue"

import { useFlyer } from "../composables/useFlyer"
import { usePhase } from "../composables/usePhase"
import { useQueryParams } from "../composables/useQueryParams"
import { useRound } from "../composables/useRound"

import { useFlyerStore } from "../stores/flyer"

enum Display {
    Fixtures,
    Standings,
    Info,
}

const router = useRouter()

const flyerStore = useFlyerStore()

const {
    mainPhase,
    currentPhase,
    currentPlayOffPhase,
} = useFlyer(flyerStore.flyer)

const {
    settings: mainPhaseSettings,
} = usePhase(mainPhase.value)

const {
    settings,
    clockDisplay,
    totalCost,
    hasStarted,
    hasFinished,
    isInProgress,
    remainingCount,
    currentRound,
    nextRoundToGenerate,
    readyToGenerateNextRound,
    generationIsComplete,
    pauseClock,
    resumeClock,
} = usePhase(currentPhase.value)

const {
    winners,
} = useRound(currentRound.value, settings.value)

const {
    queryParams,
    isHistoric,
} = useQueryParams()

const display = ref(Display.Fixtures)

const [showPrice, toggleShowPrice] = useToggle()
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

const header = computed(() => {
    if (currentPlayOffPhase.value) {
        return mainPhaseSettings.value.name + ": " + settings.value.name
    }

    return settings.value.name
})

const generateNextRoundLabel = computed(() => {
    if (nextRoundToGenerate.value) {
        return "Generate " + nextRoundToGenerate.value.name
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
    if (!currentPhase.value || !nextRoundToGenerate.value || winners.value.length <= 0) {
        return
    }

    flyerStore.generateRound(
        currentPhase.value.id,
        nextRoundToGenerate.value.index,
        winners.value)
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
    if (!currentPhase.value) {
        throw "No phase to finish!"
    }

    const success = flyerStore.finish(currentPhase.value)
    if (!success) {
        throw "Failed to finish phase!"
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
                <h1>{{ header }}</h1>

                <div class="cursor-pointer" @click="() => toggleShowPrice()">
                    <Price v-if="showPrice" :amount="totalCost" />
                    <Clock v-else :elapsedSeconds="clockDisplay" />
                </div>
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
                :disabled="!readyToGenerateNextRound"
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
