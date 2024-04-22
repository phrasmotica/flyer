<script setup lang="ts">
import { computed } from "vue"
import { useI18n } from "vue-i18n"

import PlayerBreakInput from "./PlayerBreakInput.vue"

import { useFixture } from "@/composables/useFixture"
import { useFlyer } from "@/composables/useFlyer"
import { usePhaseEvents } from "@/composables/usePhaseEvents"
import { useRounds } from "@/composables/useRounds"

import type { Fixture } from "@/data/Fixture"

import { useFlyerStore } from "@/stores/flyer"

const { t } = useI18n()

const props = defineProps<{
    fixture: Fixture
}>()

const flyerStore = useFlyerStore()

const {
    currentPhase,
} = useFlyer(flyerStore.flyer)

const phaseEvents = usePhaseEvents(currentPhase.value)

const {
    getRound,
} = useRounds(currentPhase.value)

const {
    fixture,
    breakerId,
    players,
} = useFixture("modal", props.fixture, getRound(props.fixture.id), currentPhase.value)

const canAssignBreaker = computed(() => !!breakerId.value)

const assignBreaker = () => {
    if (!currentPhase.value || !fixture.value || !breakerId.value) {
        return
    }

    flyerStore.assignBreaker(currentPhase.value, fixture.value.id, breakerId.value)

    const message = phaseEvents.fixtureAssignedBreaker(fixture.value, breakerId.value)
    flyerStore.addPhaseEvent(currentPhase.value, message)
}
</script>

<template>
    <div class="p-fluid">
        <p class="m-0 text-center">
            {{ t('fixture.whoWillBreakFirst') }}
        </p>

        <div class="grid m-0">
            <PlayerBreakInput
                v-for="p in players"
                class="col-6"
                v-model="breakerId"
                :fixture="fixture!"
                :playerId="p" />
        </div>

        <Button
            type="button"
            :label="t('common.assign')"
            :disabled="!canAssignBreaker"
            @click="assignBreaker" />
    </div>
</template>
