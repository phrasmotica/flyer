<script setup lang="ts">
import ScoreCell from "./ScoreCell.vue"

import type { Result } from "../data/Result"

import { usePlayersStore } from "../stores/players"

const props = defineProps<{
    result: Result
}>()

const emit = defineEmits<{
    showResultModal: []
}>()

const playersStore = usePlayersStore()
</script>

<template>
    <div class="grid m-0">
        <div class="col-5">
            <span v-if="props.result.scores[0].isBye" class="text-gray-400">
                <em>bye</em>
            </span>

            <span v-else>{{ playersStore.getName(props.result.scores[0].playerId) }}</span>
        </div>

        <div class="col-2 p-0">
            <ScoreCell
                :result="props.result"
                @showResultModal="emit('showResultModal')" />
        </div>

        <div class="col-5 text-right">
            <span v-if="props.result.scores[1].isBye" class="text-gray-400">
                <em>bye</em>
            </span>

            <span v-else>{{ playersStore.getName(props.result.scores[1].playerId) }}</span>
        </div>
    </div>
</template>
