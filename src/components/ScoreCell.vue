<script setup lang="ts">
import { computed } from "vue"

import type { Result } from "../data/Result"

const props = defineProps<{
    result: Result
}>()

const emit = defineEmits<{
    clicked: []
}>()

const getResultClass = (result: Result) => {
    if (isWalkover.value || result.finishTime) {
        return "bg-primary"
    }

    if (result.startTime) {
        return "in-progress text-white"
    }

    return "bg-orange-400 text-white"
}

const isWalkover = computed(() => props.result.scores.some(s => s.isBye))
</script>

<template>
    <div class="p-2 text-center border-round-md"
        :class="[getResultClass(props.result), !isWalkover && 'cursor-pointer']"
        @click="() => emit('clicked')">
        <span v-if="isWalkover">
            <em>W/O</em>
        </span>
        <span v-else-if="props.result.startTime" :class="[props.result.finishTime && 'font-bold']">
            {{ props.result.scores.map(s => s.score).join("-") }}
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
