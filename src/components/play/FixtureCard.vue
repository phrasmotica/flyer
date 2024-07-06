<script setup lang="ts">
import { computed, watch } from "vue"

import CommentMessage from "./CommentMessage.vue"
import ScoreCard from "./ScoreCard.vue"
import TableBadge from "./TableBadge.vue"

import { useFixture } from "@/composables/useFixture"
import { useFlyer } from "@/composables/useFlyer"
import { usePhase } from "@/composables/usePhase"
import { useRound } from "@/composables/useRound"
import { useRounds } from "@/composables/useRounds"
import { useTables } from "@/composables/useTables"

import type { Fixture } from "@/data/Fixture"

import { useFlyerStore } from "@/stores/flyer"
import { useUiStore } from "@/stores/ui"

const props = defineProps<{
    fixture: Fixture
    highlightedFixtureId: string
    showComment: boolean
    vertical?: boolean
    static?: boolean
}>()

const emit = defineEmits<{
    showModal: []
    highlight: []
}>()

const flyerStore = useFlyerStore()
const uiStore = useUiStore()

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
    uiStore.isDebugMode && canStartFixture(fixture, status.value) && 'border border-yellow-500',
    uiStore.isDebugMode && fixture.id === nextFreeFixture.value?.id && 'border border-red-500',
]
</script>

<template>
    <div
        v-if="fixture"
        class="border-round-md border-1"
        :class="fixtureCardClass(fixture)">
        <div v-if="uiStore.isDebugMode" class="text-center">
            {{ fixture.id }}
        </div>

        <div v-if="table && !fixture.finishTime" class="text-center">
            <TableBadge :table="table" />
        </div>

        <div class="grid m-0 py-1">
            <div class="col-6 p-0" :class="props.vertical && 'col-12'">
                <ScoreCard
                    :static="props.static"
                    :fixture="fixture"
                    :scoreIndex="0"
                    position="left"
                    :highlightedFixtureId="props.highlightedFixtureId"
                    @showModal="emit('showModal')"
                    @highlight="emit('highlight')" />
            </div>

            <div class="col-6 p-0" :class="props.vertical && 'col-12 mt-2'">
                <ScoreCard
                    :static="props.static"
                    :fixture="fixture"
                    :scoreIndex="1"
                    :position="props.vertical ? 'left' : 'right'"
                    :highlightedFixtureId="props.highlightedFixtureId"
                    @showModal="emit('showModal')"
                    @highlight="emit('highlight')" />
            </div>
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
