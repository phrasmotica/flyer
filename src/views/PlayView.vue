<script setup lang="ts">
import { computed, ref } from "vue"
import { useI18n } from "vue-i18n"
import { useRouter } from "vue-router"
import { useTitle, useToggle } from "@vueuse/core"

import AbandonFlyerModal from "@/components/modals/AbandonFlyerModal.vue"
import FinishFlyerModal from "@/components/modals/FinishFlyerModal.vue"
import FixtureModal from "@/components/modals/FixtureModal.vue"
import FlyerClock from "@/components/play/FlyerClock.vue"
import PageTemplate from "@/components/PageTemplate.vue"
import PlayButtons from "@/components/play/PlayButtons.vue"
import PlaySections from "@/components/play/PlaySections.vue"

import { useFlyer } from "@/composables/useFlyer"
import { usePhase } from "@/composables/usePhase"
import { useQueryParams } from "@/composables/useQueryParams"
import { useRound } from "@/composables/useRound"
import { useRouting } from "@/composables/useRouting"
import { useScreenSizes } from "@/composables/useScreenSizes"

import type { Fixture } from "@/data/Fixture"

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
} = usePhase(mainPhase.value)

const {
    settings,
    hasFinished,
    currentRound,
    nextRoundToGenerate,
} = usePhase(currentPhase.value)

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
                @confirmFinish="confirmFinish"
                @generateNextRound="generateNextRound"
                @goToPastFlyers="routing.toHistory"
                @showAbandonModal="() => setShowAbandonModal(true)" />
        </template>
    </PageTemplate>
</template>
