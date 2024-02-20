<script setup lang="ts">
import ScoreCell from "./ScoreCell.vue"

import type { Player } from "../models/Player"
import type { Result } from "../models/Result"

const props = defineProps<{
    players: Player[]
    result: Result
}>()

const emit = defineEmits<{
    showResultModal: [result: Result]
}>()

const getPlayerName = (id: string) => {
    return props.players.find(p => p.id === id)?.name ?? id
}
</script>

<template>
    <div class="grid m-0">
        <div class="col-5">
            {{ getPlayerName(props.result.scores[0].playerId) }}
        </div>

        <ScoreCell :result="props.result" @showResultModal="() => emit('showResultModal', props.result)" />

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
