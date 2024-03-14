<script setup lang="ts">
import { computed } from "vue"

import type { Result } from "../data/Result"

const props = defineProps<{
    result: Result
    isWinner: boolean
    score?: number
    simple?: boolean
    large?: boolean
    static?: boolean
}>()

const emit = defineEmits<{
    clicked: []
}>()

const cellClass = computed(() => {
    if (props.result.cancelledTime) {
        return "bg-pink-400 text-white"
    }

    if (props.result.finishTime && !props.isWinner) {
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

const scoreText = computed(() => {
    if (props.simple && props.result.finishTime) {
        return props.isWinner ? "W" : "L"
    }

    return props.score
})

const handleClick = () => {
    if (!props.static) {
        emit('clicked')
    }
}
</script>

<template>
    <div class="score-cell px-2 py-1 flex align-items-center justify-content-center border-round-md"
        :class="[cellClass, !props.static && !isWalkover && 'cursor-pointer', props.large && 'large']"
        @click="handleClick">
        <i v-if="props.result.cancelledTime" class="pi pi-times" />
        <span v-else-if="props.result.startTime"
            class="score-text"
            :class="[
                isWinner && 'font-bold',
                props.large && isWinner && 'text-4xl',
                props.large && !isWinner && 'text-2xl',
            ]">
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

.score-cell.large {
    width: 4rem;
    height: 4rem;
}

.loser {
    background-color: red;
}

.in-progress {
    background-color: #0ea5e9;
}
</style>
