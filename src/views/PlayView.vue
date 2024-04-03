<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref } from "vue"
import { useToggle } from "@vueuse/core"
import { useRouter } from "vue-router"

import Clock from "../components/Clock.vue"
import ConfirmModal from "../components/ConfirmModal.vue"
import FixtureModal from "../components/FixtureModal.vue"
import PageTemplate from "../components/PageTemplate.vue"
import PlayButtons from "../components/PlayButtons.vue"
import PlaySections from "../components/PlaySections.vue"
import Price from "../components/Price.vue"

import { useFlyer } from "../composables/useFlyer"
import { usePhase } from "../composables/usePhase"
import { usePhaseSettings } from "../composables/usePhaseSettings"
import { useQueryParams } from "../composables/useQueryParams"
import { useRound } from "../composables/useRound"
import { useScreenSizes } from "../composables/useScreenSizes"

import type { Fixture } from "../data/Fixture"

import { useFlyerStore } from "../stores/flyer"
import { useUiStore } from "../stores/ui"

enum Display {
    Fixtures,
    Tables,
    Standings,
    Info,
}

const router = useRouter()

const flyerStore = useFlyerStore()
const uiStore = useUiStore()

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
    tables,
    clockDisplay,
    totalCost,
    hasFinished,
    isInProgress,
    currentRound,
    nextRoundToGenerate,
    estimatedDurationMinutes,
    nextFixture,
    nextFreeFixture,
    getRoundWithIndex,
    pauseClock,
    resumeClock,
} = usePhase(currentPhase.value)

const {
    isRoundRobin,
} = usePhaseSettings(settings.value)

const {
    winners,
} = useRound(currentRound.value, currentPhase.value)

const {
    queryParams,
} = useQueryParams()

const {
    isSmallScreen,
} = useScreenSizes()

const display = ref(Display.Fixtures)

const [showPrice, toggleShowPrice] = useToggle()
const showFinishModal = ref(false)
const showAbandonModal = ref(false)

const selectedFixture = ref<Fixture>()
const showFixtureModal = ref(false)

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

const autoComplete = () => {
    if (!currentPhase.value || !nextFixture.value) {
        return
    }

    // LOW: compute the correct race-to for the next fixture
    const raceTo = settings.value.raceTo

    flyerStore.autoCompleteFixture(
        currentPhase.value,
        nextFixture.value,
        tables.value[0].id,
        raceTo)

    if (isRoundRobin.value && nextFixture.value && nextFreeFixture.value) {
        const [roundA, indexA] = getRoundWithIndex(nextFixture.value.id)
        const [roundB, indexB] = getRoundWithIndex(nextFreeFixture.value.id)

        if (roundA && roundB) {
            // if necessary, swap the next fixture in the current round (or
            // the first fixture in the next round) with the first upcoming fixture
            // where all players are free
            flyerStore.swapFixtures(currentPhase.value, roundA, indexA, roundB, indexB)
        }
    }
}

const selectForRecording = (f: Fixture) => {
    selectedFixture.value = f
    showFixtureModal.value = true
}

const hideFixtureModal = () => {
    showFixtureModal.value = false
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
                    <Clock v-else :elapsedMilliseconds="clockDisplay" :warnAfterMilliseconds="estimatedDurationMinutes * 60000" />
                </div>
            </div>

            <!-- MEDIUM: make this layout into a slot/template in PageTemplate.vue -->
            <div v-if="!isSmallScreen" class="grid m-0">
                <div class="col-8 p-0 pr-2">
                    <PlaySections
                        overflow
                        pinButton
                        @selectFixture="selectForRecording" />
                </div>

                <div class="col-4 p-0 pl-2 border-left-1">
                    <div class="mt-1">
                        <PlayButtons
                            :isFixtures="display === Display.Fixtures"
                            @autoComplete="autoComplete"
                            @confirmFinish="confirmFinish"
                            @generateNextRound="generateNextRound"
                            @goToPastFlyers="goToPastFlyers"
                            @showAbandonModal="() => showAbandonModal = true" />
                    </div>

                    <div class="border-top-1 pt-2">
                        <PlaySections v-if="uiStore.pinnedSection"
                            overflow
                            pinnedOnly />

                        <p v-else class="m-0 text-center text-sm font-italic text-color-secondary">
                            No section pinned
                        </p>
                    </div>
                </div>
            </div>
            <div v-else>
                <PlaySections
                    @selectFixture="selectForRecording" />
            </div>

            <FixtureModal
                :visible="showFixtureModal"
                :fixture="selectedFixture"
                @hide="hideFixtureModal" />

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

        <template v-if="isSmallScreen" #buttons>
            <PlayButtons
                :isFixtures="display === Display.Fixtures"
                @autoComplete="autoComplete"
                @confirmFinish="confirmFinish"
                @generateNextRound="generateNextRound"
                @goToPastFlyers="goToPastFlyers"
                @showAbandonModal="() => showAbandonModal = true" />
        </template>
    </PageTemplate>
</template>
