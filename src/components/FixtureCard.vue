<script setup lang="ts">
import { computed } from "vue"

import ScoreCell from "./ScoreCell.vue"

import type { Result } from "../data/Result"

import { usePlayersStore } from "../stores/players"

const props = defineProps<{
    result: Result
    highlightedResultId: string
}>()

const emit = defineEmits<{
    showResultModal: []
    highlight: [resultId: string]
}>()

const playersStore = usePlayersStore()

const isWalkover = computed(() => props.result.scores.some(s => s.isBye))

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
    <div class="grid m-0" :class="[props.highlightedResultId === props.result.id && 'bg-blue-100']">
        <div
            class="col-5"
            :class="[
                props.highlightedResultId === props.result.parentFixtureIds[0] && 'bg-blue-100',
                props.result.parentFixtureIds[0] && 'cursor-pointer',
            ]"
            @click="handleNameClick(props.result.parentFixtureIds[0])">
            <span v-if="props.result.scores[0].isBye" class="text-gray-400">
                <em>(bye)</em>
            </span>

            <span v-else-if="props.result.parentFixtureIds[0]" class="text-gray-400">
                <em>TBD</em>
            </span>

            <span v-else>{{ playersStore.getName(props.result.scores[0].playerId) }}</span>
        </div>

        <div class="col-2 p-0">
            <ScoreCell
                :result="props.result"
                @clicked="handleClick" />
        </div>

        <div
            class="col-5 text-right"
            :class="[
                props.highlightedResultId === props.result.parentFixtureIds[1] && 'bg-blue-100',
                props.result.parentFixtureIds[0] && 'cursor-pointer',
            ]"
            @click="handleNameClick(props.result.parentFixtureIds[1])">
            <span v-if="props.result.scores[1].isBye" class="text-gray-400">
                <em>(bye)</em>
            </span>

            <span v-else-if="props.result.parentFixtureIds[1]" class="text-gray-400">
                <em>TBD</em>
            </span>

            <span v-else>{{ playersStore.getName(props.result.scores[1].playerId) }}</span>
        </div>
    </div>
</template>
