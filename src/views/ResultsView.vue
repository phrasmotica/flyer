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
import { useStandings } from "../composables/useStandings"

import { Format, createPlayOffSettings } from "../data/FlyerSettings"
import { KnockoutScheduler } from "../data/KnockoutScheduler"

import { useFlyerStore, usePlayOffStore } from "../stores/flyer"
import { useFlyerHistoryStore } from "../stores/flyerHistory"

const router = useRouter()

const flyerStore = useFlyerStore()
const flyerHistoryStore = useFlyerHistoryStore()
const playOffStore = usePlayOffStore()

const {
    playOffIsComplete,
} = useFlyer(flyerStore.flyer)

const {
    requiresPlayOff,
    orderedPlayOffs,
} = useStandings(flyerStore.results, flyerStore.players, flyerStore.settings)

const showGoToSetupModal = ref(false)
const showStartPlayOffModal = ref(false)

const hasPlayedOff = computed(() => !nextPlayOff.value)

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

const nextPlayOff = computed(() => {
    const remaining = orderedPlayOffs.value.filter(p => !playOffIsComplete(p.id))
    return remaining.length > 0 ? remaining[0] : null
})

const startPlayOff = () => {
    if (!nextPlayOff.value) {
        console.debug("No play-offs remaining!")
        return
    }

    playOffStore.start(
        createPlayOffSettings(flyerStore.flyer, nextPlayOff.value),
        new KnockoutScheduler(false),
        nextPlayOff.value.players
    )

    hideStartPlayOffModal()

    router.push({
        name: "playOff",
    })
}

const alreadySaved = computed(() => {
    return flyerHistoryStore.pastFlyers.some(f => f.id === flyerStore.flyer.id)
})

const saveButtonText = computed(() => alreadySaved.value ? "Flyer saved!" : "Save flyer")

const playOffButtonText = computed(() => "Start the " + nextPlayOff.value?.name || "(UNKNOWN PLAY-OFF)")

const save = () => {
    // TODO: save play-off as part of the flyer object
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
</script>

<template>
    <PageTemplate>
        <template #content>
            <div class="flex align-items-baseline justify-content-between border-bottom-1 mb-1">
                <h1>{{ flyerStore.settings.name }}</h1>

                <Clock :elapsedSeconds="flyerStore.durationSeconds || 0" />
            </div>

            <ResultsTable v-if="flyerStore.settings.format === Format.RoundRobin" />

            <Podium v-if="flyerStore.settings.format === Format.Knockout" />

            <div v-if="!requiresPlayOff" class="border-top-1 mt-1 pt-1">
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
                <Button class="mb-2" :label="saveButtonText" :disabled="alreadySaved" @click="save" />

                <Button label="New flyer" severity="info" @click="confirmGoToSetup" />
            </div>
        </template>
    </PageTemplate>
</template>
