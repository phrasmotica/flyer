<script setup lang="ts">
import { computed } from "vue"
import { useRouter } from "vue-router"
import { useToggle } from "@vueuse/core"

import Clock from "../components/Clock.vue"
import ConfirmModal from "../components/modals/ConfirmModal.vue"
import LightsCalculator from "../components/LightsCalculator.vue"
import PageTemplate from "../components/PageTemplate.vue"
import Podium from "../components/Podium.vue"
import ResultsButtons from "../components/ResultsButtons.vue"
import ResultsMessages from "@/components/ResultsMessages.vue"
import ResultsTable from "../components/ResultsTable.vue"
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
        <template #content>
            <!-- LOW: put this into the header template. Currently not possible because
            the results-container div needs to contain the content as well... -->
            <div id="results-container">
                <div class="flex align-items-baseline justify-content-between border-bottom-1 mb-2">
                    <h1>{{ settings.name }}</h1>

                    <Clock
                        :elapsedMilliseconds="durationMilliseconds || 0"
                        :warnAfterMilliseconds="estimatedDurationMinutes * 60000" />
                </div>

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
            <!-- TODO: create a component for this -->
            <ConfirmModal
                v-model:visible="showGoToSetupModal"
                header="New flyer"
                message="Are you sure you want to start a new flyer? The current one has not been saved!"
                confirmLabel="Yes"
                :confirmDisabled="false"
                cancelLabel="No"
                @confirm="goToSetup"
                @hide="() => setShowGoToSetupModal(false)" />

            <!-- TODO: create a component for this -->
            <ConfirmModal
                v-model:visible="showStartPlayOffModal"
                header="Start Play-Off"
                :message="`Are you sure you want to start the ${nextPlayOff?.name || '(UNKNOWN)'}?`"
                confirmLabel="Yes"
                :confirmDisabled="false"
                cancelLabel="No"
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
