<script setup lang="ts">
import { computed, ref } from "vue"

import RecordResultModal from "./RecordResultModal.vue"

import type { Player } from "../models/Player"
import type { Result } from "../models/Result"

const props = defineProps<{
    players: Player[]
    raceTo: number
    results: Result[]
}>()

const emit = defineEmits<{
    updateResult: [result: Result, finish: boolean]
}>()

const selectedResult = ref<Result>()
const showModal = ref(false)

const resultsRemaining = computed(() => props.results.filter(r => !r.finishTime).length)

const hasResult = (player1: string, player2: string) => {
    return props.results.some(r => r.scores.some(s => s.playerId === player1) && r.scores.some(s => s.playerId === player2))
}

const getResult = (player1: string, player2: string) => {
    return props.results.find(r => r.scores.some(s => s.playerId === player1) && r.scores.some(s => s.playerId === player2))
}

const getScore = (player1: string, player2: string) => {
    const result = getResult(player1, player2)
    if (!result) {
        return null
    }

    return result.scores.find(s => s.playerId === player1)!.score
}

const getResultClass = (player1: string, player2: string) => {
    const score1 = getScore(player1, player2)
    const score2 = getScore(player2, player1)

    if (score1 === null || score2 === null) {
        return ""
    }

    const result = getResult(player1, player2)
    if (!result?.startTime) {
        return "bg-cyan-100"
    }

    if (score1 > score2) {
        return "bg-primary"
    }

    if (score1 < score2) {
        return "bg-red-500"
    }

    return "bg-yellow-200"
}

const selectForRecording = (p: Player, q: Player) => {
    selectedResult.value = getResult(p.id, q.id)

    showModal.value = true
}

const updateResult = (result: Result, finish: boolean) => {
    emit('updateResult', result, finish)
    hideModal()
}

const hideModal = () => {
    showModal.value = false
}
</script>

<template>
    <div class="flex flex-column md:flex-row justify-content-between md:align-items-end border-bottom-1 pb-1">
        <h1>Head-to-Head</h1>

        <h4>Results remaining: {{ resultsRemaining }}</h4>
    </div>

    <DataTable :value="props.players">
        <Column>
            <template #body="slotProps">
                {{ slotProps.data.name }}
            </template>
        </Column>

        <Column v-for="(q, i) in props.players" :header="q.name">
            <template #body="slotProps">
                <div v-if="slotProps.index === i" class="flex justify-content-center">
                    -
                </div>

                <div v-else-if="hasResult(slotProps.data.id, q.id)"
                    class="flex justify-content-center cursor-pointer"
                    :class="getResultClass(slotProps.data.id, q.id)"
                    @click="() => selectForRecording(slotProps.data, q)">
                    <span v-if="getResult(slotProps.data.id, q.id)!.startTime">
                        {{ getScore(slotProps.data.id, q.id) }}-{{ getScore(q.id, slotProps.data.id) }}
                    </span>
                    <span v-else>
                        ?-?
                    </span>
                </div>

                <div v-else class="flex justify-content-center">
                    ?
                </div>
            </template>
        </Column>
    </DataTable>

    <RecordResultModal
        v-if="selectedResult"
        :visible="showModal"
        :players="props.players"
        :result="selectedResult"
        :raceTo="props.raceTo"
        @confirm="updateResult"
        @cancel="hideModal" />
</template>
