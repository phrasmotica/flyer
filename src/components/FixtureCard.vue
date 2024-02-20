<script setup lang="ts">
import type { Player } from "../models/Player"
import type { Result } from "../models/Result"

const props = defineProps<{
    players: Player[]
    result: Result
}>()

const emit = defineEmits<{
    showResultModal: [result: Result]
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

const getPlayerName = (id: string) => {
    return props.players.find(p => p.id === id)?.name ?? id
}
</script>

<template>
    <div class="grid m-0">
        <div class="col-5">
            {{ getPlayerName(props.result.scores[0].playerId) }}
        </div>

        <div class="col-2 text-center cursor-pointer border-round-md"
            :class="getResultClass(props.result)"
            @click="() => emit('showResultModal', props.result)">
            <span v-if="props.result.startTime" :class="[props.result.finishTime && 'font-bold']">
                {{ props.result.scores.map(s => s.score).join("-") }}
            </span>
            <span v-else>
                ?-?
            </span>
        </div>

        <div class="col-5 text-right">
            {{ getPlayerName(props.result.scores[1].playerId) }}
        </div>
    </div>
</template>

<style scoped>
.in-progress {
    color: #ffffff;
    background: #0ea5e9;
    border: 1px solid #0ea5e9;
}
</style>
