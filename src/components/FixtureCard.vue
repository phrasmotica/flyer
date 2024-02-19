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
    if (!result?.startTime) {
        return "bg-cyan-100"
    }

    return "bg-cyan-400"
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

        <div class="col-2 text-center cursor-pointer"
            :class="getResultClass(props.result)"
            @click="() => emit('showResultModal', props.result)">
            <span v-if="props.result?.startTime">
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
