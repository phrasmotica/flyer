<script setup lang="ts">
import { computed, onMounted, watch } from "vue"

import Clock from "./Clock.vue"
import TableBadge from "./TableBadge.vue"
import RaceToBadge from "./RaceToBadge.vue"

import { useFixture } from "@/composables/useFixture"
import { useFlyer } from "@/composables/useFlyer"
import { usePhase } from "@/composables/usePhase"

import type { Fixture } from "@/data/Fixture"

import { useFlyerStore } from "@/stores/flyer"

const props = defineProps<{
    fixture: Fixture
}>()

const flyerStore = useFlyerStore()

const {
    currentPhase,
} = useFlyer(flyerStore.flyer)

const {
    getRound,
    getTable,
} = usePhase(currentPhase.value)

const {
    fixture,
    raceTo,
    elapsedMilliseconds,
    hasStarted,
    isInProgress,
    estimatedDurationMilliseconds,
    durationMilliseconds,
    resumeClock,
} = useFixture("modal", props.fixture, getRound(props.fixture.id), currentPhase.value)

watch(props, () => {
    ensureResumed()
})

onMounted(() => {
    ensureResumed()
})

const ensureResumed = () => {
    if (isInProgress.value) {
        resumeClock()
    }
}

const table = computed(() => getTable(fixture.value?.tableId || ""))
</script>

<template>
    <div class="p-fluid">
        <div v-if="table" class="mb-2">
            <Clock
                v-if="hasStarted"
                :elapsedMilliseconds="durationMilliseconds || elapsedMilliseconds"
                :warnAfterMilliseconds="estimatedDurationMilliseconds" />

            <div class="p-fluid flex justify-content-center gap-2">
                <TableBadge :table="table" />

                <RaceToBadge singular :value="raceTo" />
            </div>
        </div>

        <!-- HIGH: show assigned breaker if applicable -->
    </div>
</template>
