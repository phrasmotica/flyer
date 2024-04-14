<script setup lang="ts">
import { computed } from "vue"
import { useI18n } from "vue-i18n"

import { useFixture } from "@/composables/useFixture"
import { useFlyer } from "@/composables/useFlyer"
import { usePhase } from "@/composables/usePhase"
import { usePhaseEvents } from "@/composables/usePhaseEvents"
import { useRound } from "@/composables/useRound"
import { useRounds } from "@/composables/useRounds"

import type { Fixture } from "@/data/Fixture"
import { FixtureStatus } from "@/data/FixtureStatus"

import { useFlyerStore } from "@/stores/flyer"

const { t } = useI18n()

const props = defineProps<{
    fixture: Fixture
}>()

const flyerStore = useFlyerStore()

const {
    currentPhase,
} = useFlyer(flyerStore.flyer)

const {
    canStartFixture,
    getFixtureStatus,
} = usePhase(currentPhase.value)

const {
    currentRound,
    getRound,
} = useRounds(currentPhase.value)

const phaseEvents = usePhaseEvents(currentPhase.value)

const {
    status: currentRoundStatus,
} = useRound(currentRound.value, currentPhase.value)

const {
    fixture,
    hasStarted,
} = useFixture("modal", props.fixture, getRound(props.fixture?.id || ""), currentPhase.value)

const canStart = computed(() => canStartFixture(fixture.value, currentRoundStatus.value))

const fixtureStatus = computed(() => getFixtureStatus(fixture.value, currentRoundStatus.value))

const startButtonText = computed(() => {
    switch (fixtureStatus.value) {
        case FixtureStatus.Unknown:
            return t('fixture.unknownStatus')

        case FixtureStatus.WaitingForRoundGeneration:
            return t('fixture.waitingForRoundGenerationStatus')

        case FixtureStatus.WaitingForPreviousResult:
            return t('fixture.waitingForPreviousResultStatus')

        case FixtureStatus.WaitingForPlayers:
            return t('fixture.waitingForPlayersStatus')

        case FixtureStatus.WaitingForRound:
            return t('fixture.waitingForRoundStatus')

        case FixtureStatus.WaitingForTable:
            return t('fixture.waitingForTableStatus')

        default:
            return t('common.start')
    }
})

const startFixture = () => {
    if (!currentPhase.value || !fixture.value) {
        return
    }

    flyerStore.startFixture(currentPhase.value, fixture.value.id)

    const message = phaseEvents.fixtureStarted(fixture.value)
    flyerStore.addPhaseEvent(currentPhase.value, message)
}
</script>

<template>
    <div class="p-fluid">
        <Button v-if="!hasStarted"
            type="button"
            :label="startButtonText"
            :disabled="!canStart"
            @click="startFixture" />
    </div>
</template>
