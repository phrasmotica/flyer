<script setup lang="ts">
import { computed, ref } from "vue"

import RecordResultModal from "../components/RecordResultModal.vue"

import type { Player } from "../models/Player"
import type { Result } from "../models/Result"

const props = defineProps<{
    players: Player[]
    raceTo: number
    results: Result[]
}>()

const emit = defineEmits<{
    addResult: [result: Result]
}>()

const player1 = ref(props.players[0])
const player2 = ref(props.players[1])
const showModal = ref(false)

const expectedResults = computed(() => props.players.length * (props.players.length - 1) / 2)
const resultsRemaining = computed(() => expectedResults.value - props.results.length)

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

    if (score1 > score2) {
        return "bg-primary"
    }

    if (score1 < score2) {
        return "bg-red-500"
    }

    return "bg-yellow-200"
}

const selectForRecording = (p: Player, q: Player) => {
    player1.value = p
    player2.value = q

    showModal.value = true
}

const confirmResult = (result: Result) => {
    emit('addResult', result)
    hideModal()
}

const hideModal = () => {
    showModal.value = false
}
</script>

<template>
    <div class="flex justify-content-between align-items-end border-bottom-1">
        <h1>Round-Robin</h1>

        <h3>Results remaining: {{ resultsRemaining }}</h3>
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
                    class="flex justify-content-center"
                    :class="getResultClass(slotProps.data.id, q.id)">
                    {{ getScore(slotProps.data.id, q.id) }}-{{ getScore(q.id, slotProps.data.id) }}
                </div>

                <div v-else class="p-fluid">
                    <Button
                        class="flex justify-content-center"
                        severity="info"
                        @click="() => selectForRecording(slotProps.data, q)">
                        <i class="pi pi-file-edit" />
                    </Button>
                </div>
            </template>
        </Column>
    </DataTable>

    <RecordResultModal
        :visible="showModal"
        :players="[player1, player2]"
        :raceTo="props.raceTo"
        @confirm="confirmResult"
        @cancel="hideModal" />
</template>
