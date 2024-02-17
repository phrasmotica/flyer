<script setup lang="ts">
import { computed } from "vue"

import type { Result } from "../models/Result"

const props = defineProps<{
    players: string[]
    results: Result[]
}>()

const getWinner = (r: Result) => {
    if (isDraw(r)) {
        return null
    }

    const maxScore = r.scores.reduce((s, t) => s.score > t.score ? s : t)
    return maxScore.player
}

const isDraw = (r: Result) => {
    const maxScore = r.scores.map(s => s.score).reduce((x, y) => Math.max(x, y))
    return r.scores.every(s => s.score === maxScore)
}

const getLoser = (r: Result) => {
    if (isDraw(r)) {
        return null
    }

    const minScore = r.scores.reduce((s, t) => s.score < t.score ? s : t)
    return minScore.player
}

const getWins = (player: string, results: Result[]) => results.filter(r => getWinner(r) === player).length

const getDraws = (player: string, results: Result[]) => results.filter(r => isDraw(r) && r.scores.some(s => s.player === player)).length

const getLosses = (player: string, results: Result[]) => results.filter(r => getLoser(r) === player).length

const sortPlayers = (player1: string, player2: string, results: Result[]) => {
    const wins1 = getWins(player1, results)
    const wins2 = getWins(player2, results)

    if (wins1 !== wins2) {
        return wins2 - wins1
    }

    return 0
}

const sortedPlayers = computed(() => props.players.sort((a, b) => sortPlayers(a, b, props.results)))
</script>

<template>
    <div>
        <div class="d-flex justify-content-between align-items-end">
            <h3>Results</h3>
        </div>

        <table class="table">
            <thead>
                <tr>
                    <th>#</th>
                    <th>Player</th>
                    <th>Won</th>
                    <th>Drew</th>
                    <th>Lost</th>
                </tr>
            </thead>
            <tbody>
                <tr v-for="p, i in sortedPlayers" :class="[i === 0 && 'table-success']">
                    <td>{{ i + 1 }}</td>
                    <td><strong>{{ p }}</strong></td>
                    <td>{{ getWins(p, props.results) }}</td>
                    <td>{{ getDraws(p, props.results) }}</td>
                    <td>{{ getLosses(p, props.results) }}</td>
                </tr>
            </tbody>
        </table>
    </div>
</template>

<style scoped>
h3 {
    margin: 0px;
}
</style>
