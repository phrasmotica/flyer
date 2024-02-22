<script setup lang="ts">
import ScoreCell from "./ScoreCell.vue"

import type { Result } from "../models/Result"

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
            {{ playersStore.getName(props.result.scores[0].playerId) }}
        </div>

        <div class="col-2 p-0">
            <ScoreCell
                :result="props.result"
                @showResultModal="emit('showResultModal')" />
        </div>

        <div class="col-5 text-right">
            {{ playersStore.getName(props.result.scores[1].playerId) }}
        </div>
    </div>
</template>
