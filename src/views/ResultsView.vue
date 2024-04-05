<script setup lang="ts">
import { computed } from "vue"
import { useRouter } from "vue-router"
import { useTitle, useToggle } from "@vueuse/core"

import DarkModeToggleButton from "@/components/DarkModeToggleButton.vue"
import FlyerClock from "@/components/FlyerClock.vue"
import LightsCalculator from "../components/LightsCalculator.vue"
import NewFlyerModal from "@/components/modals/NewFlyerModal.vue"
import PageTemplate from "../components/PageTemplate.vue"
import Podium from "../components/Podium.vue"
import ResultsButtons from "../components/ResultsButtons.vue"
import ResultsMessages from "@/components/ResultsMessages.vue"
import ResultsTable from "../components/ResultsTable.vue"
import SidebarLayoutToggleButton from "@/components/SidebarLayoutToggleButton.vue"
import StartPlayOffModal from "../components/modals/StartPlayOffModal.vue"
import WinningsList from "../components/WinningsList.vue"

import { useDownloadImage } from "../composables/useDownloadImage"
import { useFlyer } from "../composables/useFlyer"
import { usePhase } from "../composables/usePhase"
import { usePhaseSettings } from "../composables/usePhaseSettings"
import { usePodium } from "../composables/usePodium"
import { useQueryParams } from "../composables/useQueryParams"
import { useRouting } from "../composables/useRouting"
import { useScreenSizes } from "../composables/useScreenSizes"
import { useStandings } from "../composables/useStandings"
import { useTimedRef } from "../composables/useTimedRef"

import { useFlyerStore } from "../stores/flyer"
import { useFlyerHistoryStore } from "../stores/flyerHistory"

const routing = useRouting(useRouter())

const flyerStore = useFlyerStore()
const flyerHistoryStore = useFlyerHistoryStore()

const {
    saveElement,
} = useDownloadImage()

const {
    flyer,
    mainPhase,
    phaseIsComplete,
} = useFlyer(flyerStore.flyer)

const {
    settings,
    estimatedDurationMinutes,
    durationMilliseconds,
} = usePhase(mainPhase.value)

useTitle("Flyer - " + settings.value.name + " - Results")

const {
    isKnockout,
    isRoundRobin,
    isWinnerStaysOn,
} = usePhaseSettings(settings.value)

const {
    moneyRecipients,
} = usePodium(mainPhase.value)

const {
    requiresPlayOff,
    orderedPlayOffs,
} = useStandings(mainPhase.value)

const {
    isHistoric,
} = useQueryParams()

const {
    isSmallScreen,
} = useScreenSizes()

const [showGoToSetupModal, setShowGoToSetupModal] = useToggle()
const [showStartPlayOffModal, setShowStartPlayOffModal] = useToggle()

const {
    value: imageSaved,
} = useTimedRef(2000, false)

const confirmGoToSetup = () => {
    if (alreadySaved.value) {
        goToSetup()
    }
    else {
        setShowGoToSetupModal(true)
    }
}

const goToSetup = () => {
    flyerStore.clear()

    setShowGoToSetupModal(false)

    routing.toSetup()
}

const nextPlayOff = computed(() => {
    const remaining = orderedPlayOffs.value.filter(p => !phaseIsComplete(p.id))
    return remaining.length > 0 ? remaining[0] : null
})

const alreadySaved = computed(() => {
    return flyerHistoryStore.pastFlyers.some(f => f.id === flyer.value?.id)
})

const startPlayOff = () => {
    if (!nextPlayOff.value || !mainPhase.value) {
        console.debug("No play-offs remaining!")
        return
    }

    flyerStore.addPlayOff(nextPlayOff.value, mainPhase.value)

    setShowStartPlayOffModal(false)

    routing.toPlay()
}

const saveResults = () => {
    const element = document.getElementById("results-container")!

    saveElement({
        element,
        baseName: settings.value.name,
        onClone(_, element) {
            element.style.padding = "1rem"
        },
        success() {
            imageSaved.value = true
        }
    })
}

const save = () => {
    if (flyerStore.flyer && !alreadySaved.value) {
        flyerHistoryStore.add(flyerStore.flyer)
    }
}
</script>

<template>
    <PageTemplate>
        <template #header>
            <div class="flex gap-2 align-items-center">
                <div class="flex flex-grow-1 align-items-baseline justify-content-between">
                    <h1>{{ settings.name }} - Results</h1>

                    <FlyerClock />
                </div>

                <div class="flex gap-1">
                    <SidebarLayoutToggleButton v-if="!isSmallScreen" />

                    <DarkModeToggleButton v-if="!isSmallScreen" />
                </div>
            </div>
        </template>

        <template #content>
            <!-- MEDIUM: make this contain the page header as well. Maybe create
            a new component (modal?) specifically for downloading an image of -->
            <div id="results-container">
                <div v-if="isRoundRobin || isWinnerStaysOn">
                    <ResultsTable />

                    <ResultsMessages />
                </div>

                <div v-if="isKnockout">
                    <Podium />

                    <div v-if="moneyRecipients.length > 1" class="border-top-1 mt-1 pt-1">
                        <WinningsList header="Other prize money:" :winnings="moneyRecipients.slice(1)" />
                    </div>
                </div>
            </div>

            <div v-if="!requiresPlayOff && !isHistoric" class="border-top-1 mt-1 pt-1">
                <LightsCalculator />
            </div>
        </template>

        <template v-if="!isSmallScreen" #sidebar>
            <ResultsButtons
                sidebar
                :imageSaved="imageSaved"
                @confirmGoToSetup="confirmGoToSetup"
                @confirmStartPlayOff="() => setShowStartPlayOffModal(true)"
                @goToPastFlyers="routing.toHistory"
                @save="save"
                @saveResults="saveResults" />
        </template>

        <template #modals>
            <NewFlyerModal
                v-model:visible="showGoToSetupModal"
                @confirm="goToSetup"
                @hide="() => setShowGoToSetupModal(false)" />

            <StartPlayOffModal
                v-model:visible="showStartPlayOffModal"
                @confirm="startPlayOff"
                @hide="() => setShowStartPlayOffModal(false)" />
        </template>

        <template v-if="isSmallScreen" #buttons>
            <ResultsButtons
                :imageSaved="imageSaved"
                @confirmGoToSetup="confirmGoToSetup"
                @confirmStartPlayOff="() => setShowStartPlayOffModal(true)"
                @goToPastFlyers="routing.toHistory"
                @save="save"
                @saveResults="saveResults" />
        </template>
    </PageTemplate>
</template>
