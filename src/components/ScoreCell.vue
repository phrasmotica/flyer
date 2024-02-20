<script setup lang="ts">
import type { Result } from "../models/Result"

const props = defineProps<{
    result: Result
}>()

const emit = defineEmits<{
    showResultModal: []
}>()

const getResultClass = (result: Result) => {
    if (result.finishTime) {
        return "bg-primary"
    }

    if (result.startTime) {
        return "in-progress"
    }

    return "bg-cyan-100"
}
</script>

<template>
    <div class="p-2 text-center cursor-pointer border-round-md"
        :class="getResultClass(props.result)"
        @click="() => emit('showResultModal')">
        <span v-if="props.result.startTime" :class="[props.result.finishTime && 'font-bold']">
            {{ props.result.scores.map(s => s.score).join("-") }}
        </span>
        <span v-else>
            ?-?
        </span>
    </div>
</template>

<style scoped>
.in-progress {
    color: #ffffff;
    background: #0ea5e9;
    border: 1px solid #0ea5e9;
}
</style>
