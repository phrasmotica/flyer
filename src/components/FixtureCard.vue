<script setup lang="ts">
import ScoreCell from "./ScoreCell.vue"

import { useFlyer } from "../composables/useFlyer"
import { useMatch } from "../composables/useMatch"
import { useSettings } from "../composables/useSettings"

import type { Result } from "../data/Result"

import { useFlyerStore } from "../stores/flyer"

const props = defineProps<{
    result: Result
    highlightedResultId: string
}>()

const emit = defineEmits<{
    showResultModal: []
    highlight: [resultId: string]
}>()

const flyerStore = useFlyerStore()

const {
    settings,
    getPlayerName,
} = useFlyer(flyerStore.flyer)

const {
    result,
    winner,
    isWalkover,
} = useMatch("card", props.result)

const {
    isWinnerStaysOn,
    isRandomDraw,
} = useSettings(settings.value)

const playerNameClass = (playerId: string) => {
    if (winner.value) {
        if (winner.value === playerId) {
            return "font-bold"
        }

        return "text-color-secondary"
    }

    return ""
}

const handleClick = () => {
    if (!isWalkover.value) {
        emit("showResultModal")
    }
}

const handleNameClick = (id: string) => {
    if (id) {
        emit('highlight', id)
    }
}

const playerCellClass = (result: Result, slot: 0 | 1) => {
    const parentFixture = result.parentFixtures[slot]
    const isHighlighted = props.highlightedResultId && props.highlightedResultId === parentFixture?.fixtureId

    return [
        isHighlighted && parentFixture?.takeLoser && 'loser',
        isHighlighted && 'highlight text-white',
        'cursor-pointer',
    ]
}
</script>

<template>
    <div
        v-if="result"
        class="border-round-md border-1"
        :class="[
            props.highlightedResultId === result.id ? 'border-dashed' : 'border-transparent'
        ]">
        <div class="grid m-0 py-1">
            <div class="col-5 p-0">
                <div
                    class="p-1 mr-1 border-round-md text-left"
                    :class="playerCellClass(result, 0)"
                    @click="handleNameClick(result.id)">
                    <span v-if="result.scores[0].isBye" class="text-gray-400">
                        <em>(bye)</em>
                    </span>

                    <span v-else-if="result.cancelledTime">
                        -
                    </span>

                    <span v-else-if="result.scores[0].playerId" :class="playerNameClass(result.scores[0].playerId)">
                        {{ getPlayerName(result.scores[0].playerId) }}
                    </span>

                    <span v-else-if="result.parentFixtures[0]?.fixtureId || isRandomDraw">
                        <em class="text-gray-400">TBD</em>
                    </span>
                </div>
            </div>

            <div class="col-2 p-0">
                <ScoreCell
                    :result="result"
                    :winner="winner"
                    :simple="isWinnerStaysOn"
                    @clicked="handleClick" />
            </div>

            <div class="col-5 p-0">
                <div
                    class="p-1 ml-1 border-round-md text-right"
                    :class="playerCellClass(result, 1)"
                    @click="handleNameClick(result.id)">
                    <span v-if="result.scores[1].isBye" class="text-gray-400">
                        <em>(bye)</em>
                    </span>

                    <span v-else-if="result.cancelledTime">
                        -
                    </span>

                    <span v-else-if="result.scores[1].playerId" :class="playerNameClass(result.scores[1].playerId)">
                        {{ getPlayerName(result.scores[1].playerId) }}
                    </span>

                    <span v-else-if="result.parentFixtures[1]?.fixtureId || isRandomDraw">
                        <em class="text-gray-400">TBD</em>
                    </span>
                </div>
            </div>
        </div>

        <div v-if="result.comment" class="mt-1 pt-1 border-top-1 border-none border-dashed border-gray-200">
            <p class="m-0 text-xs md:text-sm">
                {{ result.comment }}
            </p>
        </div>
    </div>
</template>

<style scoped>
.highlight {
    background-color: darkgreen!important;
}

.highlight.loser {
    background-color: firebrick!important;
}
</style>
