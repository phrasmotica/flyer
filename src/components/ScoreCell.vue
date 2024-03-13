<script setup lang="ts">
import { computed } from "vue"

import type { Result } from "../data/Result"

const props = defineProps<{
    result: Result
    winner: string
    simple?: boolean
}>()

const emit = defineEmits<{
    clicked: []
}>()

const getResultClass = (result: Result) => {
    if (result.cancelledTime) {
        return "bg-pink-400 text-white"
    }

    if (isWalkover.value || result.finishTime) {
        return "bg-primary"
    }

    if (result.startTime) {
        return "in-progress text-white"
    }

    return "bg-orange-400 text-white"
}

const scoreText = computed(() => {
    if (props.simple) {
        return props.result.scores.map(s => s.playerId === props.winner ? "W" : "L").join("-")
    }

    return props.result.scores.map(s => s.score).join("-")
})

const isWalkover = computed(() => props.result.scores.some(s => s.isBye))
</script>

<template>
    <div class="p-2 py-1 text-center border-round-md"
        :class="[getResultClass(props.result), !isWalkover && 'cursor-pointer']"
        @click="() => emit('clicked')">
        <span v-if="props.result.cancelledTime">
            <i class="pi pi-times" />
        </span>
        <span v-else-if="isWalkover">
            <em>W/O</em>
        </span>
        <span v-else-if="props.result.startTime" :class="[props.result.finishTime && 'font-bold']">
            {{ scoreText }}
        </span>
        <span v-else>
            ?-?
        </span>
    </div>
</template>

<style scoped>
.in-progress {
    background: #0ea5e9;
}
</style>
