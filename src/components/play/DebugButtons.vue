<script setup lang="ts">
import { computed, watch } from "vue"

import { useFixtureList } from "@/composables/useFixtureList"
import { useFlyer } from "@/composables/useFlyer"
import { usePhase } from "@/composables/usePhase"
import { usePhaseEvents } from "@/composables/usePhaseEvents"
import { usePhaseSpecification } from "@/composables/useSpecification"
import { useStandings } from "@/composables/useStandings"
import { useTables } from "@/composables/useTables"

import { FixtureStatus } from "@/data/FixtureStatus"

import { useFixture } from "@/composables/useFixture"
import { useRounds } from "@/composables/useRounds"
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
    freeTables,
    getFixtureStatus,
} = usePhase(currentPhase.value)

const {
    getRound,
} = useRounds(currentPhase.value)

const {
    remainingCount,
    nextFixture,
} = useFixtureList(currentPhase.value)

const {
    round,
    raceTo,
} = useFixture("debug", nextFixture.value, getRound(nextFixture.value?.id || ""), currentPhase.value)

const {
    fixturesCanBeDrawn,
} = usePhaseSpecification(currentPhase.value)

const {
    standings,
} = useStandings(currentPhase.value)

const {
    tables,
} = useTables(currentPhase.value)

watch(nextFixture, () => {
    round.value = getRound(nextFixture.value?.id || "")
})

const isFixtures = computed(() => uiStore.isFixtures)

const showAutoStartButton = computed(() => {
    return remainingCount.value > 0 || !props.hideInstead
})

const showAutoCompleteButton = computed(() => {
    return remainingCount.value > 0 || !props.hideInstead
})

const canProgress = computed(() => {
    const validStatuses = [
        FixtureStatus.WaitingForAssignment,
        FixtureStatus.WaitingForBreaker,
        FixtureStatus.ReadyToStart,
    ]

    return validStatuses.includes(getFixtureStatus(nextFixture.value))
})

const autoStart = () => {
    if (!currentPhase.value || !nextFixture.value || !canProgress.value) {
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
    if (!currentPhase.value || !nextFixture.value || !canProgress.value) {
        return
    }

    const message = phaseEvents.fixtureAutoCompleted(nextFixture.value)

    const fixtureRaceTo = raceTo.value || 1

    flyerStore.autoCompleteFixture(
        currentPhase.value,
        nextFixture.value,
        tables.value[0].id,
        fixtureRaceTo,
        fixturesCanBeDrawn.value)

    flyerStore.addPhaseEvent(currentPhase.value, message)
}

const autoCompleteRemaining = () => {
    if (!currentPhase.value || !nextFixture.value) {
        return
    }

    // BUG: this could be different for each fixture
    const fixtureRaceTo = raceTo.value || 1

    flyerStore.autoCompletePhase(
        currentPhase.value,
        tables.value[0].id,
        fixtureRaceTo,
        fixturesCanBeDrawn.value)

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
            :disabled="!isFixtures || !canProgress || remainingCount <= 0"
            @click="autoStart" />

        <Button
            v-if="showAutoCompleteButton"
            class="mb-2"
            label="Auto-complete"
            severity="help"
            :disabled="!isFixtures || !canProgress || remainingCount <= 0"
            @click="autoComplete" />

        <Button
            v-if="showAutoCompleteButton"
            class="mb-2"
            label="Auto-complete remaining"
            severity="help"
            :disabled="!isFixtures || !canProgress || remainingCount <= 0"
            @click="autoCompleteRemaining" />
    </div>
</template>
