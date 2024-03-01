<script setup lang="ts">
import { computed, watch } from "vue"

import ScoreCell from "./ScoreCell.vue"

import { useMatch } from "../composables/useMatch"

import { Format } from "../data/FlyerSettings"
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

const { result } = useMatch("card", props.result)

watch(props, () => {
    result.value = props.result
})

const isRandomDraw = computed(() => flyerStore.settings.format === Format.Knockout && flyerStore.settings.randomlyDrawAllRounds)

const isWalkover = computed(() => result.value.scores.some(s => s.isBye))

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
</script>

<template>
    <div
        class="grid m-0 py-1 border-round-md border-1"
        :class="[
            props.highlightedResultId === result.id ? 'border-dashed' : 'border-transparent'
        ]">
        <div class="col-5 p-0">
            <div
                class="p-1 mr-1 border-round-md text-left"
                :class="[
                    props.highlightedResultId === result.parentFixtureIds[0] && 'highlight',
                    result.parentFixtureIds[0] && 'cursor-pointer',
                ]"
                @click="handleNameClick(result.parentFixtureIds[0])">
                <span v-if="result.scores[0].isBye" class="text-gray-400">
                    <em>(bye)</em>
                </span>

                <span v-else-if="result.scores[0].playerId">
                    {{ flyerStore.getPlayerName(result.scores[0].playerId) }}
                </span>

                <span v-else-if="result.parentFixtureIds[0] || isRandomDraw">
                    <em class="text-gray-400">TBD</em>
                </span>
            </div>
        </div>

        <div class="col-2 p-0">
            <ScoreCell
                :result="result"
                @clicked="handleClick" />
        </div>

        <div class="col-5 p-0">
            <div
                class="p-1 ml-1 border-round-md text-right"
                :class="[
                    props.highlightedResultId === result.parentFixtureIds[1] && 'highlight',
                    result.parentFixtureIds[0] && 'cursor-pointer',
                ]"
                @click="handleNameClick(result.parentFixtureIds[1])">
                <span v-if="result.scores[1].isBye" class="text-gray-400">
                    <em>(bye)</em>
                </span>

                <span v-else-if="result.scores[1].playerId">
                    {{ flyerStore.getPlayerName(result.scores[1].playerId) }}
                </span>

                <span v-else-if="result.parentFixtureIds[1] || isRandomDraw">
                    <em class="text-gray-400">TBD</em>
                </span>
            </div>
        </div>
    </div>
</template>

<style scoped>
.highlight {
    background-color: powderblue!important;
}

@media (prefers-color-scheme: dark) {
    .highlight {
        background-color: firebrick!important;
    }
}
</style>
