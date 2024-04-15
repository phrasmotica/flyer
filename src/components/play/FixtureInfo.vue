<script setup lang="ts">
import { computed, onMounted, watch } from "vue"
import { useI18n } from "vue-i18n"

import Clock from "./Clock.vue"
import TableBadge from "./TableBadge.vue"
import RaceToBadge from "./RaceToBadge.vue"

import { useFixture } from "@/composables/useFixture"
import { useFlyer } from "@/composables/useFlyer"
import { usePlayers } from "@/composables/usePlayers"
import { useRounds } from "@/composables/useRounds"
import { useTables } from "@/composables/useTables"

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

const {
    getRound,
} = useRounds(currentPhase.value)

const {
    getPlayer,
} = usePlayers(currentPhase.value)

const {
    getTable,
} = useTables(currentPhase.value)

const {
    fixture,
    bestOf,
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
const breaker = computed(() => getPlayer(fixture.value?.breakerId || ""))
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

                <RaceToBadge singular :value="Math.ceil((bestOf + 1) / 2)" />
            </div>
        </div>

        <div v-if="breaker && !hasStarted" class="mb-2">
            <p class="m-0">
                <span class="font-bold">{{ breaker.name }}</span>
                {{ t('fixture.playerToBreak') }}
            </p>
        </div>
    </div>
</template>
