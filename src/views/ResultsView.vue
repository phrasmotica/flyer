<script setup lang="ts">
import { useTitle, useToggle } from "@vueuse/core"
import { computed } from "vue"
import { useI18n } from "vue-i18n"
import { useRouter } from "vue-router"

import PageTemplate from "@/components/PageTemplate.vue"
import CreatePlayOffModal from "@/components/modals/CreatePlayOffModal.vue"
import FinishFlyerModal from "@/components/modals/FinishFlyerModal.vue"
import NewFlyerModal from "@/components/modals/NewFlyerModal.vue"
import SkipPlayOffModal from "@/components/modals/SkipPlayOffModal.vue"
import FlyerClock from "@/components/play/FlyerClock.vue"
import LightsCalculator from "@/components/results/LightsCalculator.vue"
import Podium from "@/components/results/Podium.vue"
import ResultsButtons from "@/components/results/ResultsButtons.vue"
import ResultsMessages from "@/components/results/ResultsMessages.vue"
import ResultsTable from "@/components/results/ResultsTable.vue"
import WinningsList from "@/components/results/WinningsList.vue"
import WinningsSummary from "@/components/results/WinningsSummary.vue"

import { useDownloadImage } from "@/composables/useDownloadImage"
import { useFlyer } from "@/composables/useFlyer"
import { usePodium } from "@/composables/usePodium"
import { useQueryParams } from "@/composables/useQueryParams"
import { useRankings } from "@/composables/useRankings"
import { useRouting } from "@/composables/useRouting"
import { useScreenSizes } from "@/composables/useScreenSizes"
import { usePhaseSpecification } from "@/composables/useSpecification"
import { useStandings } from "@/composables/useStandings"
import { useTimedRef } from "@/composables/useTimedRef"

import type { Player } from "@/data/Player"
import type { PlayerRecord } from "@/data/PlayerRecord"

import { useFlyerStore } from "@/stores/flyer"
import { useFlyerHistoryStore } from "@/stores/flyerHistory"

const { t } = useI18n()

const routing = useRouting(useRouter())

const flyerStore = useFlyerStore()
const flyerHistoryStore = useFlyerHistoryStore()

const {
    saveElement,
} = useDownloadImage()

const {
    flyer,
    mainPhase,
    nextUnresolvedTieBreaker,
    overallStandings,
    isFinished,
} = useFlyer(flyerStore.flyer)

const {
    settings,
    isKnockout,
    isRoundRobin,
    isWinnerStaysOn,
} = usePhaseSpecification(mainPhase.value)

useTitle("Flyer - " + settings.value.name + " - " + t('results.results'))

const {
    moneyRecipients,
} = usePodium(mainPhase.value)

const {
    createPlayOffFor,
} = useStandings(mainPhase.value)

const {
    computeDummyStandings,
    canPlayOff,
} = useRankings()

const {
    isHistoric,
} = useQueryParams()

const {
    isSmallScreen,
} = useScreenSizes()

const [showGoToSetupModal, setShowGoToSetupModal] = useToggle()
const [showSkipPlayOffModal, setShowSkipPlayOffModal] = useToggle()
const [showCreatePlayOffModal, setShowCreatePlayOffModal] = useToggle()
const [showFinishFlyerModal, setShowFinishFlyerModal] = useToggle()

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

const alreadySaved = computed(() => {
    return flyerHistoryStore.pastFlyers.some(f => f.id === flyer.value?.id)
})

const skipPlayOff = (players: Player[]) => {
    if (!nextUnresolvedTieBreaker.value || !mainPhase.value) {
        console.debug("No play-offs remaining!")
        return
    }

    const ranking = computeDummyStandings(players)

    flyerStore.skipPlayOff(mainPhase.value, nextUnresolvedTieBreaker.value, ranking)

    setShowSkipPlayOffModal(false)
}

const createPlayOff = (records: PlayerRecord[], raceTo: number) => {
    if (!mainPhase.value) {
        console.debug("No phase to create a play-off for!")
        return
    }

    if (!canPlayOff(records)) {
        console.debug("Cannot create a play-off for less than 2 players!")
        return
    }

    const forRank = Math.min(...records.map(r => r.rank))
    const playOff = createPlayOffFor(records, forRank)

    flyerStore.addPlayOff(mainPhase.value, playOff, raceTo)

    setShowCreatePlayOffModal(false)

    routing.toPlay()
}

const finishFlyer = () => {
    flyerStore.finish(overallStandings.value)

    setShowFinishFlyerModal(false)
}

const saveResults = () => {
    const element = document.getElementById("results-container")!

    saveElement({
        element,
        baseName: settings.value.name,
        onClone(document, element) {
            const header = document.getElementById("results-header")!
            header.classList.add("border-bottom-1")
            header.classList.add("mb-2")
            element.prepend(header)

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
            <div id="results-header">
                {{ settings.name }} - {{ t('results.results') }}
            </div>
        </template>

        <template #subHeaderLeft>
            <FlyerClock />
        </template>

        <template #content>
            <div id="results-container">
                <div v-if="isRoundRobin || isWinnerStaysOn">
                    <ResultsTable />

                    <ResultsMessages />

                    <div v-if="isFinished" class="mt-1">
                        <WinningsSummary />
                    </div>
                </div>

                <div v-if="isKnockout">
                    <Podium />

                    <div v-if="moneyRecipients.length > 1" class="border-top-1 mt-1 pt-1">
                        <WinningsList
                            :header="t('results.otherPrizeMoney')"
                            :winnings="moneyRecipients.slice(1)" />
                    </div>
                </div>
            </div>

            <div v-if="isFinished && !isHistoric" class="border-top-1 mt-1 pt-1">
                <LightsCalculator />
            </div>
        </template>

        <template v-if="!isSmallScreen" #sidebar>
            <ResultsButtons
                sidebar
                :imageSaved="imageSaved"
                @confirmGoToSetup="confirmGoToSetup"
                @confirmSkipPlayOff="() => setShowSkipPlayOffModal(true)"
                @confirmCreatePlayOff="() => setShowCreatePlayOffModal(true)"
                @confirmFinishFlyer="() => setShowFinishFlyerModal(true)"
                @goToPastFlyers="routing.toHistory"
                @save="save"
                @saveResults="saveResults" />
        </template>

        <template #modals>
            <NewFlyerModal
                v-model:visible="showGoToSetupModal"
                @confirm="goToSetup"
                @hide="() => setShowGoToSetupModal(false)" />

            <SkipPlayOffModal
                v-model:visible="showSkipPlayOffModal"
                @confirmRanking="skipPlayOff"
                @hide="() => setShowSkipPlayOffModal(false)" />

            <CreatePlayOffModal
                v-model:visible="showCreatePlayOffModal"
                @create="createPlayOff"
                @hide="() => setShowCreatePlayOffModal(false)" />

            <FinishFlyerModal
                v-model:visible="showFinishFlyerModal"
                @confirm="finishFlyer"
                @hide="() => setShowFinishFlyerModal(false)" />
        </template>

        <template v-if="isSmallScreen" #buttons>
            <ResultsButtons
                :imageSaved="imageSaved"
                @confirmGoToSetup="confirmGoToSetup"
                @confirmSkipPlayOff="() => setShowSkipPlayOffModal(true)"
                @confirmCreatePlayOff="() => setShowCreatePlayOffModal(true)"
                @confirmFinishFlyer="() => setShowFinishFlyerModal(true)"
                @goToPastFlyers="routing.toHistory"
                @save="save"
                @saveResults="saveResults" />
        </template>
    </PageTemplate>
</template>
