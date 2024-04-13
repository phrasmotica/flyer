<script setup lang="ts">
import { computed } from "vue"

import { useFlyer } from "@/composables/useFlyer"
import { usePhase } from "@/composables/usePhase"
import { usePhaseEvents } from "@/composables/usePhaseEvents"

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
    remainingCount,
    nextFixture,
    getFixtureSwap,
} = usePhase(currentPhase.value)

const isFixtures = computed(() => uiStore.isFixtures)

const showAutoCompleteButton = computed(() => {
    return remainingCount.value > 0 || !props.hideInstead
})

// LOW: compute the correct race-to for the next fixture
const raceTo = computed(() => settings.value.raceTo)

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

    const swap = getFixtureSwap()
    if (swap) {
        // generate this now - the computed properties update after the swap...
        const message = phaseEvents.fixturesSwapped(swap)

        // if necessary, swap the next fixture in the current round (or
        // the first fixture in the next round) with the first upcoming fixture
        // where all players are free
        const didSwap = flyerStore.swapFixtures(currentPhase.value, swap)
        if (didSwap) {
            flyerStore.addPhaseEvent(currentPhase.value, message)
        }
    }
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
</script>

<template>
    <div>
        <!-- debug stuff, no need to localise -->
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
