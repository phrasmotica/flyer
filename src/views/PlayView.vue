<script setup lang="ts">
import { computed, ref } from "vue"
import { useRouter } from "vue-router"
import { useTitle, useToggle } from "@vueuse/core"

import AbandonFlyerModal from "../components/modals/AbandonFlyerModal.vue"
import FinishFlyerModal from "../components/modals/FinishFlyerModal.vue"
import FixtureModal from "../components/modals/FixtureModal.vue"
import FlyerClock from "../components/FlyerClock.vue"
import PageTemplate from "../components/PageTemplate.vue"
import PlayButtons from "../components/PlayButtons.vue"
import PlaySections from "../components/PlaySections.vue"
import SidebarLayoutToggleButton from "../components/SidebarLayoutToggleButton.vue"

import { useFlyer } from "../composables/useFlyer"
import { usePhase } from "../composables/usePhase"
import { usePhaseEvents } from "../composables/usePhaseEvents"
import { usePhaseSettings } from "../composables/usePhaseSettings"
import { useQueryParams } from "../composables/useQueryParams"
import { useRound } from "../composables/useRound"
import { useRouting } from "../composables/useRouting"
import { useScreenSizes } from "../composables/useScreenSizes"

import type { Fixture } from "../data/Fixture"

import { useFlyerStore } from "../stores/flyer"
import { useUiStore } from "../stores/ui"

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
    hasFinished,
    currentRound,
    nextRoundToGenerate,
    nextFixture,
    nextFreeFixture,
    getRoundWithIndex,
} = usePhase(currentPhase.value)

useTitle("Flyer - " + settings.value.name)

const phaseEvents = usePhaseEvents(currentPhase.value)

const {
    isRoundRobin,
} = usePhaseSettings(settings.value)

const {
    winners,
} = useRound(currentRound.value, currentPhase.value)

const {
    queryParams,
    isHistoric,
} = useQueryParams()

const routing = useRouting(useRouter(), queryParams.value)

const {
    isSmallScreen,
} = useScreenSizes()

const [showFixtureModal, setShowFixtureModal] = useToggle()
const [showFinishModal, setShowFinishModal] = useToggle()
const [showAbandonModal, setShowAbandonModal] = useToggle()

const selectedFixture = ref<Fixture>()

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
        setShowFinishModal(true)
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

    setShowFinishModal(false)

    routing.toResults()
}

const abandon = () => {
    flyerStore.clear()

    setShowAbandonModal(false)

    routing.toSetup()
}

const autoComplete = () => {
    if (!currentPhase.value || !nextFixture.value) {
        return
    }

    // LOW: compute the correct race-to for the next fixture
    const raceTo = settings.value.raceTo

    const message = phaseEvents.fixtureAutoCompleted(nextFixture.value)

    flyerStore.autoCompleteFixture(
        currentPhase.value,
        nextFixture.value,
        tables.value[0].id,
        raceTo)

    flyerStore.addPhaseEvent(currentPhase.value, message)

    if (isRoundRobin.value && nextFixture.value && nextFreeFixture.value) {
        const [roundA, indexA] = getRoundWithIndex(nextFixture.value.id)
        const [roundB, indexB] = getRoundWithIndex(nextFreeFixture.value.id)

        if (roundA && roundB) {
            // generate this now - the computed properties update after the swap...
            const message = phaseEvents.fixturesSwapped(nextFixture.value, nextFreeFixture.value)

            // if necessary, swap the next fixture in the current round (or
            // the first fixture in the next round) with the first upcoming fixture
            // where all players are free
            const didSwap = flyerStore.swapFixtures(currentPhase.value, roundA, indexA, roundB, indexB)
            if (didSwap) {
                flyerStore.addPhaseEvent(currentPhase.value, message)
            }
        }
    }
}

const autoCompleteRemaining = () => {
    if (!currentPhase.value || !nextFixture.value) {
        return
    }

    console.log("autoCompleteRemaining")

    const raceTo = settings.value.raceTo

    flyerStore.autoCompletePhase(
        currentPhase.value,
        tables.value[0].id,
        raceTo)

    const message = phaseEvents.phaseAutoCompleted()
    flyerStore.addPhaseEvent(currentPhase.value, message)
}

const selectForRecording = (f: Fixture) => {
    selectedFixture.value = f
    setShowFixtureModal(true)
}

const hideFixtureModal = () => {
    setShowFixtureModal(false)
}
</script>

<template>
    <PageTemplate>
        <template #header>
            <div class="flex gap-2 align-items-center">
                <div class="flex flex-grow-1 align-items-baseline justify-content-between">
                    <h1>{{ header }}</h1>

                    <FlyerClock />
                </div>

                <SidebarLayoutToggleButton v-if="!isSmallScreen" />
            </div>
        </template>

        <template #content>
            <PlaySections
                :overflow="!isSmallScreen"
                :pinnable="!isSmallScreen"
                @selectFixture="selectForRecording" />
        </template>

        <template v-if="!isSmallScreen" #sidebar>
            <PlayButtons
                sidebar
                @autoComplete="autoComplete"
                @autoCompleteRemaining="autoCompleteRemaining"
                @confirmFinish="confirmFinish"
                @generateNextRound="generateNextRound"
                @goToPastFlyers="routing.toHistory"
                @showAbandonModal="() => setShowAbandonModal(true)" />

            <div v-if="!isHistoric" class="border-top-1 pt-2">
                <PlaySections v-if="uiStore.pinnedSection"
                    overflow
                    pinnedOnly />

                <p v-else class="m-0 text-center text-sm font-italic text-color-secondary">
                    No section pinned
                </p>
            </div>
        </template>

        <template #modals>
            <FixtureModal
                :visible="showFixtureModal"
                :fixture="selectedFixture"
                @hide="hideFixtureModal" />

            <FinishFlyerModal
                v-model:visible="showFinishModal"
                @confirm="finish"
                @hide="() => setShowFinishModal(false)" />

            <AbandonFlyerModal
                v-model:visible="showAbandonModal"
                @confirm="abandon"
                @hide="() => setShowAbandonModal(false)" />
        </template>

        <template v-if="isSmallScreen" #buttons>
            <PlayButtons
                @autoComplete="autoComplete"
                @autoCompleteRemaining="autoCompleteRemaining"
                @confirmFinish="confirmFinish"
                @generateNextRound="generateNextRound"
                @goToPastFlyers="routing.toHistory"
                @showAbandonModal="() => setShowAbandonModal(true)" />
        </template>
    </PageTemplate>
</template>
