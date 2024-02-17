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

const isIncomplete = (player: string, results: Result[]) => {
    return results.filter(r => r.scores.some(s => s.player === player)).length < props.players.length - 1
}

const sortPlayers = (player1: string, player2: string, results: Result[]) => {
    const wins1 = getWins(player1, results)
    const wins2 = getWins(player2, results)

    if (wins1 !== wins2) {
        return wins2 - wins1
    }

    const losses1 = getLosses(player1, results)
    const losses2 = getLosses(player2, results)

    if (losses1 !== losses2) {
        return losses2 - losses1
    }

    return 0
}

const sortedPlayers = computed(() => props.players.sort((a, b) => sortPlayers(a, b, props.results)))

const tableData = computed(() => sortedPlayers.value.map((p, i) => ({
    rank: i + 1,
    name: p,
    wins: getWins(p, props.results),
    draws: getDraws(p, props.results),
    losses: getLosses(p, props.results),
    incomplete: isIncomplete(p, props.results),
})))

const rowClass = (data: any) => {
    return [
        {
            'bg-primary': !data.incomplete && data.rank === 1,
            'bg-gray-400': data.incomplete,
        },
    ]
}
</script>

<template>
    <h1>Results</h1>

    <DataTable :value="tableData" :rowClass="rowClass">
        <Column field="rank" header="#"></Column>
        <Column field="name" header="Name"></Column>
        <Column field="wins" header="Won"></Column>
        <Column field="draws" header="Drew"></Column>
        <Column field="losses" header="Lost"></Column>
    </DataTable>
</template>

<style scoped>
h3 {
    margin: 0px;
}
</style>
