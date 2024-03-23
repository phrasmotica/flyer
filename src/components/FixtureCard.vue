<script setup lang="ts">
import ScoreCell from "./ScoreCell.vue"

import { useFixture } from "../composables/useFixture"
import { useFlyer } from "../composables/useFlyer"
import { usePhase } from "../composables/usePhase"
import { useSettings } from "../composables/useSettings"

import type { Fixture } from "../data/Fixture"

import { useFlyerStore } from "../stores/flyer"

const props = defineProps<{
    fixture: Fixture
    highlightedFixtureId: string
    showComment: boolean
}>()

const emit = defineEmits<{
    showModal: []
    highlight: [fixtureId: string]
}>()

const flyerStore = useFlyerStore()

const {
    currentPhase,
} = useFlyer(flyerStore.flyer)

const {
    settings,
    getRound,
    getPlayerName,
    getTableName,
} = usePhase(currentPhase.value)

const {
    fixture,
    winner,
    isWalkover,
} = useFixture("card", props.fixture, getRound(props.fixture.id), settings.value)

const {
    isWinnerStaysOn,
    isRandomDraw,
} = useSettings(settings.value)

const isHighlighted = (slot: 0 | 1) => {
    const parentFixture = props.fixture.parentFixtures[slot]
    return !!props.highlightedFixtureId && props.highlightedFixtureId === parentFixture?.fixtureId
}

const playerNameClass = (playerId: string, slot: 0 | 1) => {
    if (winner.value) {
        if (winner.value === playerId) {
            return "font-bold"
        }

        return isHighlighted(slot) ? "" : "text-color-secondary"
    }

    return ""
}

const handleClick = () => {
    if (!isWalkover.value) {
        emit("showModal")
    }
}

const handleNameClick = (id: string) => {
    if (id) {
        emit('highlight', id)
    }
}

const playerCellClass = (fixture: Fixture, slot: 0 | 1) => {
    const parentFixture = fixture.parentFixtures[slot]

    return [
        isHighlighted(slot) && parentFixture?.takeLoser && 'loser',
        isHighlighted(slot) && 'highlight text-white',
        'cursor-pointer',
    ]
}
</script>

<template>
    <div
        v-if="fixture"
        class="border-round-md border-1"
        :class="[
            props.highlightedFixtureId === fixture.id ? 'border-dashed' : 'border-transparent'
        ]">
        <div v-if="fixture.tableId && !fixture.finishTime" class="text-center">
            <p class="m-0 text-xs">
                {{ getTableName(fixture.tableId) }}
            </p>
        </div>

        <div class="grid m-0 py-1">
            <div class="flex align-items-center justify-content-between col-6 p-0 pr-1">
                <div
                    class="p-1 mr-1 border-round-md text-left flex-1"
                    :class="playerCellClass(fixture, 0)"
                    @click="handleNameClick(fixture.id)">
                    <span v-if="fixture.scores[0].isBye" class="text-gray-400">
                        <em>(bye)</em>
                    </span>

                    <span v-else-if="fixture.scores[0].playerId" :class="playerNameClass(fixture.scores[0].playerId, 0)">
                        {{ getPlayerName(fixture.scores[0].playerId) }}
                    </span>

                    <span v-else-if="fixture.parentFixtures[0]?.fixtureId || isRandomDraw">
                        <em class="text-gray-400">TBD</em>
                    </span>
                </div>

                <Badge v-if="fixture.scores[0].runouts > 0"
                    class="p-badge-sm mr-1 cursor-pointer"
                    :value="isWinnerStaysOn ? 'R' : fixture.scores[0].runouts"
                    severity="contrast"
                    @click="handleClick" />

                <ScoreCell
                    :fixture="fixture"
                    :score="fixture.scores[0].score"
                    :runouts="fixture.scores[0].runouts"
                    :isWinner="winner === fixture.scores[0].playerId"
                    :simple="isWinnerStaysOn"
                    @clicked="handleClick" />
            </div>

            <div class="flex align-items-center justify-content-between col-6 p-0 pl-1">
                <ScoreCell
                    :fixture="fixture"
                    :score="fixture.scores[1].score"
                    :runouts="fixture.scores[1].runouts"
                    :isWinner="winner === fixture.scores[1].playerId"
                    :simple="isWinnerStaysOn"
                    @clicked="handleClick" />

                <Badge v-if="fixture.scores[1].runouts > 0"
                    class="p-badge-sm ml-1 cursor-pointer"
                    :value="isWinnerStaysOn ? 'R' : fixture.scores[1].runouts"
                    severity="contrast"
                    @click="handleClick" />

                <div
                    class="p-1 ml-1 border-round-md text-right flex-1"
                    :class="playerCellClass(fixture, 1)"
                    @click="handleNameClick(fixture.id)">
                    <span v-if="fixture.scores[1].isBye" class="text-gray-400">
                        <em>(bye)</em>
                    </span>

                    <span v-else-if="fixture.scores[1].playerId" :class="playerNameClass(fixture.scores[1].playerId, 1)">
                        {{ getPlayerName(fixture.scores[1].playerId) }}
                    </span>

                    <span v-else-if="fixture.parentFixtures[1]?.fixtureId || isRandomDraw">
                        <em class="text-gray-400">TBD</em>
                    </span>
                </div>
            </div>
        </div>

        <div v-if="props.showComment && fixture.comment" class="mt-1 pt-1 border-top-1 border-none border-dashed border-gray-200">
            <p class="m-0 text-xs md:text-sm">
                {{ fixture.comment }}
            </p>
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
