<script setup lang="ts">
import { computed, watch } from "vue"

import CommentMessage from "./CommentMessage.vue"
import ScoreCard from "./ScoreCard.vue"
import TableBadge from "./TableBadge.vue"

import { useEnv } from "@/composables/useEnv"
import { useFixture } from "@/composables/useFixture"
import { useFlyer } from "@/composables/useFlyer"
import { usePhase } from "@/composables/usePhase"
import { useRound } from "@/composables/useRound"
import { useRounds } from "@/composables/useRounds"
import { useTables } from "@/composables/useTables"

import type { Fixture } from "@/data/Fixture"

import { useFlyerStore } from "@/stores/flyer"

const props = defineProps<{
    fixture: Fixture
    highlightedFixtureId: string
    showComment: boolean
}>()

const emit = defineEmits<{
    showModal: []
    highlight: []
}>()

const {
    isDebug,
} = useEnv()

const flyerStore = useFlyerStore()

const {
    currentPhase,
} = useFlyer(flyerStore.flyer)

const {
    nextFreeFixture,
    canStartFixture,
} = usePhase(currentPhase.value)

const {
    currentRound,
    getRound,
} = useRounds(currentPhase.value)

const {
    getTable,
} = useTables(currentPhase.value)

const {
    status,
} = useRound(currentRound.value, currentPhase.value)

const {
    fixture,
    round,
} = useFixture("card", props.fixture, getRound(props.fixture.id), currentPhase.value)

watch(props, () => {
    fixture.value = props.fixture
    round.value = getRound(props.fixture.id)
})

const table = computed(() => getTable(fixture.value?.tableId || ""))

const fixtureCardClass = (fixture: Fixture) => [
    fixture.id === props.highlightedFixtureId ? 'border-dashed' : 'border-transparent',
    isDebug && canStartFixture(fixture, status.value) && 'border border-yellow-500',
    isDebug && fixture.id === nextFreeFixture.value?.id && 'border border-red-500',
]
</script>

<template>
    <div
        v-if="fixture"
        class="border-round-md border-1"
        :class="fixtureCardClass(fixture)">
        <div v-if="table && !fixture.finishTime" class="text-center">
            <TableBadge :table="table" />
        </div>

        <div class="grid m-0 py-1">
            <ScoreCard
                :fixture="fixture"
                :scoreIndex="0"
                position="left"
                :highlightedFixtureId="props.highlightedFixtureId"
                @showModal="emit('showModal')"
                @highlight="emit('highlight')" />

            <ScoreCard
                :fixture="fixture"
                :scoreIndex="1"
                position="right"
                :highlightedFixtureId="props.highlightedFixtureId"
                @showModal="emit('showModal')"
                @highlight="emit('highlight')" />
        </div>

        <div v-if="props.showComment && fixture.comment">
            <CommentMessage :comment="fixture.comment" />
        </div>
    </div>
</template>

<style scoped>
.p-badge.p-badge-sm {
    font-size: 0.75rem;
    min-width: 1.25rem;
    height: 1.25rem;
    line-height: 1.25rem;
}

.highlight {
    background-color: darkgreen!important;
}

.highlight.loser {
    background-color: firebrick!important;
}
</style>
