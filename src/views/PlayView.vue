<script setup lang="ts">
import { computed, ref } from "vue"
import { useI18n } from "vue-i18n"
import { useRouter } from "vue-router"
import { useTitle, useToggle } from "@vueuse/core"

import AbandonFlyerModal from "@/components/modals/AbandonFlyerModal.vue"
import FinishPhaseModal from "@/components/modals/FinishPhaseModal.vue"
import FixtureModal from "@/components/modals/FixtureModal.vue"
import FlyerClock from "@/components/play/FlyerClock.vue"
import PageTemplate from "@/components/PageTemplate.vue"
import PlayButtons from "@/components/play/PlayButtons.vue"
import PlaySections from "@/components/play/PlaySections.vue"

import { useFlyer } from "@/composables/useFlyer"
import { usePhaseSettings } from "@/composables/usePhaseSettings"
import { usePhaseTiming } from "@/composables/usePhaseTiming"
import { useQueryParams } from "@/composables/useQueryParams"
import { useRound } from "@/composables/useRound"
import { useRounds } from "@/composables/useRounds"
import { useRouting } from "@/composables/useRouting"
import { useScreenSizes } from "@/composables/useScreenSizes"
import { useStandings } from "@/composables/useStandings"

import type { Fixture } from "@/data/Fixture"
import { PlayViewSection } from "@/data/UiSettings"

import { useFlyerStore } from "@/stores/flyer"
import { useUiStore } from "@/stores/ui"

const { t } = useI18n()

const flyerStore = useFlyerStore()
const uiStore = useUiStore()

const {
    mainPhase,
    currentPhase,
    currentPlayOffPhase,
} = useFlyer(flyerStore.flyer)

const {
    settings: mainPhaseSettings,
} = usePhaseSettings(mainPhase.value)

const {
    hasFinished,
} = usePhaseTiming(currentPhase.value)

const {
    settings,
    isKnockout,
} = usePhaseSettings(currentPhase.value)

const {
    currentRound,
    nextRoundToGenerate,
} = useRounds(currentPhase.value)

const {
    standings: currentStandings,
} = useStandings(currentPhase.value)

useTitle("Flyer - " + settings.value.name)

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

const sections = computed(() => {
    const relevantSections = [
        PlayViewSection.Fixtures,
        PlayViewSection.Standings,
        PlayViewSection.Tables,
        PlayViewSection.Info,
        PlayViewSection.EventLog,
    ]

    if (isKnockout.value) {
        relevantSections.splice(1, 1)
    }

    return relevantSections
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
        finishPhase()
    }
    else {
        setShowFinishModal(true)
    }
}

const finishPhase = () => {
    if (!currentPhase.value) {
        throw "No phase to finish!"
    }

    const success = flyerStore.finishPhase(currentPhase.value, currentStandings.value)
    if (!success) {
        throw "Failed to finish phase!"
    }

    if (isKnockout.value) {
        flyerStore.finish(currentStandings.value)
    }

    setShowFinishModal(false)

    routing.toResults()
}

const abandon = () => {
    flyerStore.clear()

    setShowAbandonModal(false)

    routing.toSetup()
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
            {{ header }}
        </template>

        <template #subHeaderLeft>
            <FlyerClock />
        </template>

        <template #content>
            <PlaySections
                :sections="sections"
                :overflow="!isSmallScreen"
                :pinnable="!isSmallScreen"
                @selectFixture="selectForRecording" />
        </template>

        <template v-if="!isSmallScreen" #sidebar>
            <PlayButtons
                sidebar
                @confirmFinish="confirmFinish"
                @generateNextRound="generateNextRound"
                @goToPastFlyers="routing.toHistory"
                @showAbandonModal="() => setShowAbandonModal(true)" />

            <div v-if="!isHistoric" class="border-top-1 pt-2">
                <PlaySections v-if="uiStore.pinnedSection"
                    :sections="[uiStore.pinnedSection]"
                    overflow
                    pinnedOnly />

                <Message v-else class="m-0" severity="secondary" :closable="false">
                    {{ t('play.noSectionPinned') }}
                </Message>
            </div>
        </template>

        <template #modals>
            <FixtureModal
                :visible="showFixtureModal"
                :fixture="selectedFixture"
                @hide="hideFixtureModal" />

            <FinishPhaseModal
                v-model:visible="showFinishModal"
                @confirm="finishPhase"
                @hide="() => setShowFinishModal(false)" />

            <AbandonFlyerModal
                v-model:visible="showAbandonModal"
                @confirm="abandon"
                @hide="() => setShowAbandonModal(false)" />
        </template>

        <template v-if="isSmallScreen" #buttons>
            <PlayButtons
                @confirmFinish="confirmFinish"
                @generateNextRound="generateNextRound"
                @goToPastFlyers="routing.toHistory"
                @showAbandonModal="() => setShowAbandonModal(true)" />
        </template>
    </PageTemplate>
</template>
