<script setup lang="ts">
import { computed, ref } from "vue"
import { useRouter } from "vue-router"

import Clock from "../components/Clock.vue"
import ConfirmModal from "../components/ConfirmModal.vue"
import IncompleteResultsMessage from "../components/IncompleteResultsMessage.vue"
import LightsCalculator from "../components/LightsCalculator.vue"
import PageTemplate from "../components/PageTemplate.vue"
import PlayOffsRequiredMessage from "../components/PlayOffsRequiredMessage.vue"
import Podium from "../components/Podium.vue"
import ResultsButtons from "../components/ResultsButtons.vue"
import ResultsTable from "../components/ResultsTable.vue"
import TiesBrokenMessage from "../components/TiesBrokenMessage.vue"
import WinningsList from "../components/WinningsList.vue"
import WinningsSummary from "../components/WinningsSummary.vue"

import { useDownloadImage } from "../composables/useDownloadImage"
import { useFlyer } from "../composables/useFlyer"
import { usePhase } from "../composables/usePhase"
import { usePhaseSettings } from "../composables/usePhaseSettings"
import { usePodium } from "../composables/usePodium"
import { useQueryParams } from "../composables/useQueryParams"
import { useStandings } from "../composables/useStandings"
import { useTimedRef } from "../composables/useTimedRef"

import { useFlyerStore } from "../stores/flyer"
import { useFlyerHistoryStore } from "../stores/flyerHistory"

const router = useRouter()

const flyerStore = useFlyerStore()
const flyerHistoryStore = useFlyerHistoryStore()

const {
    saveElement,
} = useDownloadImage()

const {
    flyer,
    mainPhase,
    playOffs,
    allPlayOffsComplete,
    incompleteCount,
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

const showGoToSetupModal = ref(false)
const showStartPlayOffModal = ref(false)

const {
    value: imageSaved,
} = useTimedRef(2000, false)

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

const confirmStartPlayOff = () => {
    showStartPlayOffModal.value = true
}

const showIncompleteMessage = computed(() => incompleteCount.value > 0 && !isWinnerStaysOn.value)

const showPlayOffsRequiredMessage = computed(() => {
    if (!requiresPlayOff.value) {
        return false
    }

    return !allPlayOffsComplete.value && playOffs.value.length > 0
})

const showTiesBrokenMessage = computed(() => {
    if (requiresPlayOff.value) {
        return false
    }

    return playOffs.value.length > 0 && !isWinnerStaysOn.value
})

const showWinningsSummary = computed(() => !requiresPlayOff.value || allPlayOffsComplete.value)

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

    hideStartPlayOffModal()

    router.push({
        name: "play",
    })
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

const hideGoToSetupModal = () => {
    showGoToSetupModal.value = false
}

const hideStartPlayOffModal = () => {
    showStartPlayOffModal.value = false
}

const goToPastFlyers = () => {
    router.push({
        name: "history",
    })
}
</script>

<template>
    <PageTemplate>
        <template #content>
            <!-- LOW: put this into the header template. Currently not possible because
            the results-container div needs to contain the content as well... -->
            <div id="results-container">
                <div class="flex align-items-baseline justify-content-between border-bottom-1 mb-1">
                    <h1>{{ settings.name }}</h1>

                    <Clock
                        :elapsedMilliseconds="durationMilliseconds || 0"
                        :warnAfterMilliseconds="estimatedDurationMinutes * 60000" />
                </div>

                <div v-if="isRoundRobin || isWinnerStaysOn">
                    <ResultsTable />

                    <div v-if="showIncompleteMessage">
                        <IncompleteResultsMessage />
                    </div>

                    <div v-if="showPlayOffsRequiredMessage" class="mt-1">
                        <PlayOffsRequiredMessage />
                    </div>

                    <div v-if="showTiesBrokenMessage" class="mt-1">
                        <TiesBrokenMessage />
                    </div>

                    <div v-if="showWinningsSummary" class="mt-1">
                        <WinningsSummary />
                    </div>
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

        <template #modals>
            <ConfirmModal
                :visible="showGoToSetupModal"
                header="New flyer"
                message="Are you sure you want to start a new flyer? The current one has not been saved!"
                confirmLabel="Yes"
                :confirmDisabled="false"
                cancelLabel="No"
                @confirm="goToSetup"
                @hide="hideGoToSetupModal" />

            <ConfirmModal
                :visible="showStartPlayOffModal"
                header="Start Play-Off"
                :message="`Are you sure you want to start the ${nextPlayOff?.name || '(UNKNOWN)'}?`"
                confirmLabel="Yes"
                :confirmDisabled="false"
                cancelLabel="No"
                @confirm="startPlayOff"
                @hide="hideStartPlayOffModal" />
        </template>

        <template #buttons>
            <ResultsButtons
                :imageSaved="imageSaved"
                @confirmGoToSetup="confirmGoToSetup"
                @confirmStartPlayOff="confirmStartPlayOff"
                @goToPastFlyers="goToPastFlyers"
                @save="save"
                @saveResults="saveResults" />
        </template>
    </PageTemplate>
</template>
