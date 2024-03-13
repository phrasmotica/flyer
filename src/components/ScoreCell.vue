<script setup lang="ts">
import { computed } from "vue"

import type { Result, Score } from "../data/Result"

const props = defineProps<{
    result: Result
    score: Score
    winner: string
    simple?: boolean
}>()

const emit = defineEmits<{
    clicked: []
}>()

const cellClass = computed(() => {
    if (props.result.cancelledTime) {
        return "bg-pink-400 text-white"
    }

    if (props.result.finishTime && !isWinner.value) {
        return "loser text-white text-sm"
    }

    if (isWalkover.value || props.result.finishTime) {
        return "bg-primary text-white text-lg"
    }

    if (props.result.startTime) {
        return "in-progress text-white"
    }

    return "bg-orange-400 text-white"
})

const isWalkover = computed(() => props.result.scores.some(s => s.isBye))

const isWinner = computed(() => props.score.playerId === props.winner)

const scoreText = computed(() => {
    if (props.simple) {
        return isWinner.value ? "W" : "L"
    }

    return props.score.score
})
</script>

<template>
    <div class="score-cell px-2 py-1 flex align-items-center justify-content-center border-round-md"
        :class="[cellClass, !isWalkover && 'cursor-pointer']"
        @click="() => emit('clicked')">
        <i v-if="props.result.cancelledTime" class="pi pi-times" />
        <span v-else-if="props.result.startTime" :class="[props.result.finishTime && isWinner && 'font-bold']">
            {{ scoreText }}
        </span>
        <span v-else>
            ?
        </span>
    </div>
</template>

<style scoped>
.score-cell {
    width: 2rem;
    height: 2rem;
}

.loser {
    background-color: red;
}

.in-progress {
    background-color: #0ea5e9;
}
</style>
