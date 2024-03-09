<script setup lang="ts">
import { computed, ref } from "vue"
import { useRouter } from "vue-router"

import Clock from "../components/Clock.vue"
import ConfirmModal from "../components/ConfirmModal.vue"
import LightsCalculator from "../components/LightsCalculator.vue"
import PageTemplate from "../components/PageTemplate.vue"
import Podium from "../components/Podium.vue"
import ResultsTable from "../components/ResultsTable.vue"

import { useFlyer } from "../composables/useFlyer"
import { useQueryParams } from "../composables/useQueryParams"
import { useStandings } from "../composables/useStandings"
import { useSettings } from "../composables/useSettings"

import { createPlayOffSettings } from "../data/FlyerSettings"
import { KnockoutScheduler } from "../data/KnockoutScheduler"

import { useFlyerStore, usePlayOffStore } from "../stores/flyer"
import { useFlyerHistoryStore } from "../stores/flyerHistory"

const router = useRouter()

const flyerStore = useFlyerStore()
const flyerHistoryStore = useFlyerHistoryStore()
const playOffStore = usePlayOffStore()

const {
    flyer,
    players,
    results,
    settings,
    durationSeconds,
    playOffIsComplete,
} = useFlyer(flyerStore.flyer)

const {
    isKnockout,
    isRoundRobin,
} = useSettings(settings.value)

const {
    requiresPlayOff,
    orderedPlayOffs,
} = useStandings(results.value, players.value, settings.value)

const {
    isHistoric,
} = useQueryParams()

const showGoToSetupModal = ref(false)
const showStartPlayOffModal = ref(false)

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
    playOffStore.clear()

    hideGoToSetupModal()

    router.push({
        name: "setup",
    })
}

const confirmStartPlayOff = () => {
    showStartPlayOffModal.value = true
}

// LOW: encapsulate these computed properties in some composable
const hasPlayedOff = computed(() => !nextPlayOff.value)

const nextPlayOff = computed(() => {
    const remaining = orderedPlayOffs.value.filter(p => !playOffIsComplete(p.id))
    return remaining.length > 0 ? remaining[0] : null
})

const alreadySaved = computed(() => {
    return flyerHistoryStore.pastFlyers.some(f => f.id === flyer.value?.id)
})

const startPlayOff = () => {
    if (!flyer.value) {
        console.debug("Cannot start play-off for no flyer!")
        return
    }

    if (!nextPlayOff.value) {
        console.debug("No play-offs remaining!")
        return
    }

    playOffStore.start(
        createPlayOffSettings(flyer.value, nextPlayOff.value),
        new KnockoutScheduler(false),
        nextPlayOff.value.players
    )

    hideStartPlayOffModal()

    router.push({
        name: "playOff",
    })
}

const saveButtonText = computed(() => alreadySaved.value ? "Flyer saved!" : "Save flyer")

const playOffButtonText = computed(() => "Start the " + nextPlayOff.value?.name || "(UNKNOWN PLAY-OFF)")

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
            <div class="flex align-items-baseline justify-content-between border-bottom-1 mb-1">
                <h1>{{ settings.name }}</h1>

                <Clock :elapsedSeconds="durationSeconds || 0" />
            </div>

            <ResultsTable v-if="isRoundRobin" />

            <Podium v-if="isKnockout" />

            <div v-if="!requiresPlayOff && !isHistoric" class="border-top-1 mt-1 pt-1">
                <LightsCalculator />
            </div>

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
            <div v-if="!hasPlayedOff && requiresPlayOff">
                <Button :label="playOffButtonText" @click="confirmStartPlayOff" />
            </div>

            <div v-else>
                <div v-if="!isHistoric">
                    <Button class="mb-2" :label="saveButtonText" :disabled="alreadySaved" @click="save" />

                    <Button label="New flyer" severity="info" @click="confirmGoToSetup" />
                </div>

                <div v-else>
                    <Button
                        label="Back to past flyers"
                        severity="info"
                        @click="goToPastFlyers" />
                </div>
            </div>
        </template>
    </PageTemplate>
</template>
