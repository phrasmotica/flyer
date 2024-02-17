<script setup lang="ts">
import { computed, ref } from "vue"

import RecordResultModal from "../components/RecordResultModal.vue"

import type { Result } from "../models/Result"

const props = defineProps<{
    players: string[]
    results: Result[]
}>()

const emit = defineEmits<{
    addResult: [result: Result]
}>()

const player1 = ref("")
const player2 = ref("")

const expectedResults = computed(() => props.players.length * (props.players.length - 1) / 2)
const resultsRemaining = computed(() => expectedResults.value - props.results.length)

const hasResult = (player1: string, player2: string) => {
    return props.results.some(r => r.scores.some(s => s.player === player1) && r.scores.some(s => s.player === player2))
}

const getResult = (player1: string, player2: string) => {
    return props.results.find(r => r.scores.some(s => s.player === player1) && r.scores.some(s => s.player === player2))
}

const getScore = (player1: string, player2: string) => {
    const result = getResult(player1, player2)
    if (!result) {
        return null
    }

    return result.scores.find(s => s.player === player1)!.score
}

const getResultClass = (player1: string, player2: string) => {
    const score1 = getScore(player1, player2)
    const score2 = getScore(player2, player1)

    if (score1 === null || score2 === null) {
        return ""
    }

    if (score1 > score2) {
        return "table-success"
    }

    if (score1 < score2) {
        return "table-danger"
    }

    return "table-warning"
}

const selectForRecording = (p: string, q: string) => {
    player1.value = p
    player2.value = q
}

const confirmResult = (result: Result) => {
    emit('addResult', result)
}
</script>

<template>
    <div>
        <div class="d-flex justify-content-between align-items-end">
            <h3>Table</h3>

            <span>Results remaining: {{ resultsRemaining }}</span>
        </div>

        <table class="table">
            <thead>
                <tr>
                    <th></th>
                    <th v-for="p, i in props.players" scope="col">
                        <strong>{{ p }}</strong>
                    </th>
                </tr>
            </thead>
            <tbody>
                <tr v-for="p in props.players">
                    <th scope="row">
                        <strong>{{ p }}</strong>
                    </th>

                    <td v-for="q in props.players" :class="[
                        q === p && 'table-secondary',
                        q !== p && hasResult(p, q) && getResultClass(p, q)
                    ]">
                        <div v-if="q !== p">
                            <span v-if="hasResult(p, q)">
                                {{ getScore(p, q) }}-{{ getScore(q, p) }}
                            </span>

                            <span v-else>
                                <button
                                    type="button"
                                    class="btn btn-success w-100"
                                    @click="() => selectForRecording(p, q)"
                                    data-bs-toggle="modal"
                                    data-bs-target="#recordResultModal">
                                    <i class="fa-solid fa-pen-to-square"></i>
                                </button>
                            </span>
                        </div>

                        <div v-else>-</div>
                    </td>
                </tr>
            </tbody>
        </table>

        <RecordResultModal
            id="recordResultModal"
            :players="[player1, player2]"
            @confirm="confirmResult" />
    </div>
</template>

<style scoped>
h3 {
    margin: 0px;
}

th {
    width: 120px;
}
</style>
