<script setup lang="ts">
import { computed } from "vue"

import { useFixtureList } from "@/composables/useFixtureList"
import { useFlyer } from "@/composables/useFlyer"
import { usePhase } from "@/composables/usePhase"
import { usePhaseEvents } from "@/composables/usePhaseEvents"
import { usePhaseSettings } from "@/composables/usePhaseSettings"
import { useTables } from "@/composables/useTables"

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
    phase,
    freeTables,
} = usePhase(currentPhase.value)

const {
    remainingCount,
    nextFixture,
} = useFixtureList(phase.value)

const {
    raceTo,
    allowDraws,
} = usePhaseSettings(currentPhase.value)

const {
    tables,
} = useTables(currentPhase.value)

const isFixtures = computed(() => uiStore.isFixtures)

const showAutoStartButton = computed(() => {
    return remainingCount.value > 0 || !props.hideInstead
})

const showAutoCompleteButton = computed(() => {
    return remainingCount.value > 0 || !props.hideInstead
})

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
}

const autoComplete = () => {
    if (!currentPhase.value || !nextFixture.value) {
        return
    }

    const message = phaseEvents.fixtureAutoCompleted(nextFixture.value)

    const fixtureRaceTo = raceTo.value || 1

    const isDraw = allowDraws.value ? Math.floor(Math.random() * 3) === 0 : false

    flyerStore.autoCompleteFixture(
        currentPhase.value,
        nextFixture.value,
        tables.value[0].id,
        fixtureRaceTo,
        isDraw)

    flyerStore.addPhaseEvent(currentPhase.value, message)
}

const autoCompleteRemaining = () => {
    if (!currentPhase.value || !nextFixture.value) {
        return
    }

    const fixtureRaceTo = raceTo.value || 1

    const isDraw = allowDraws.value && Math.floor(Math.random() * 3) === 0

    flyerStore.autoCompletePhase(
        currentPhase.value,
        tables.value[0].id,
        fixtureRaceTo,
        isDraw)

    const message = phaseEvents.phaseAutoCompleted()
    flyerStore.addPhaseEvent(currentPhase.value, message)
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
