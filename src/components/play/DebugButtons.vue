<script setup lang="ts">
import { computed } from "vue"

import { useFlyer } from "@/composables/useFlyer"
import { usePhase } from "@/composables/usePhase"
import { usePhaseEvents } from "@/composables/usePhaseEvents"

import type { Phase } from "@/data/Phase"

import { useFlyerStore } from "@/stores/flyer"
import { useUiStore } from "@/stores/ui"

const props = defineProps<{
    hideInstead?: boolean
}>()

const flyerStore = useFlyerStore()
const uiStore = useUiStore()

const {
    currentPhase,
} = useFlyer(flyerStore.flyer)

const phaseEvents = usePhaseEvents(currentPhase.value)

const {
    settings,
    tables,
    freeTables,
    remainingCount,
    nextFixture,
    getFixtureSwap,
} = usePhase(currentPhase.value)

const isFixtures = computed(() => uiStore.isFixtures)

const showAutoStartButton = computed(() => {
    return remainingCount.value > 0 || !props.hideInstead
})

const showAutoCompleteButton = computed(() => {
    return remainingCount.value > 0 || !props.hideInstead
})

// LOW: compute the correct race-to for the next fixture
const raceTo = computed(() => settings.value.raceTo)

const autoStart = () => {
    if (!currentPhase.value || !nextFixture.value || freeTables.value.length <= 0) {
        return
    }

    const message = phaseEvents.fixtureStarted(nextFixture.value)

    flyerStore.autoStartFixture(
        currentPhase.value,
        nextFixture.value,
        freeTables.value[0].id)

    flyerStore.addPhaseEvent(currentPhase.value, message)

    processSwap(currentPhase.value)
}

const autoComplete = () => {
    if (!currentPhase.value || !nextFixture.value) {
        return
    }

    const message = phaseEvents.fixtureAutoCompleted(nextFixture.value)

    flyerStore.autoCompleteFixture(
        currentPhase.value,
        nextFixture.value,
        tables.value[0].id,
        raceTo.value)

    flyerStore.addPhaseEvent(currentPhase.value, message)

    processSwap(currentPhase.value)
}

const autoCompleteRemaining = () => {
    if (!currentPhase.value || !nextFixture.value) {
        return
    }

    flyerStore.autoCompletePhase(
        currentPhase.value,
        tables.value[0].id,
        raceTo.value)

    const message = phaseEvents.phaseAutoCompleted()
    flyerStore.addPhaseEvent(currentPhase.value, message)
}

const processSwap = (phase: Phase) => {
    const swap = getFixtureSwap()
    if (swap) {
        // generate this now - the computed properties update after the swap...
        const message = phaseEvents.fixturesSwapped(swap)

        // if necessary, swap the next fixture in the current round (or
        // the first fixture in the next round) with the first upcoming fixture
        // where all players are free
        const didSwap = flyerStore.swapFixtures(phase, swap)
        if (didSwap) {
            flyerStore.addPhaseEvent(phase, message)
        }
    }
}
</script>

<template>
    <div>
        <!-- debug stuff, no need to localise -->
        <Button
            v-if="showAutoStartButton"
            class="mb-2"
            label="Auto-start"
            severity="help"
            :disabled="!isFixtures || remainingCount <= 0"
            @click="autoStart" />

        <Button
            v-if="showAutoCompleteButton"
            class="mb-2"
            label="Auto-complete"
            severity="help"
            :disabled="!isFixtures || remainingCount <= 0"
            @click="autoComplete" />

        <Button
            v-if="showAutoCompleteButton"
            class="mb-2"
            label="Auto-complete remaining"
            severity="help"
            :disabled="!isFixtures || remainingCount <= 0"
            @click="autoCompleteRemaining" />
    </div>
</template>
