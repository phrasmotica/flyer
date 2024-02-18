<script setup lang="ts">
import { computed } from "vue"

import type { Player } from "../models/Player"
import type { Result } from "../models/Result"

const props = defineProps<{
    players: Player[]
    results: Result[]
}>()

const getWinner = (r: Result) => {
    if (isDraw(r)) {
        return null
    }

    const maxScore = r.scores.reduce((s, t) => s.score > t.score ? s : t)
    return maxScore.playerId
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
    return minScore.playerId
}

const getWins = (player: string, results: Result[]) => results.filter(r => getWinner(r) === player).length

const getDraws = (player: string, results: Result[]) => results.filter(r => isDraw(r) && r.scores.some(s => s.playerId === player)).length

const getLosses = (player: string, results: Result[]) => results.filter(r => getLoser(r) === player).length

const isIncomplete = (player: string, results: Result[]) => {
    return results.filter(r => r.scores.some(s => s.playerId === player)).length < props.players.length - 1
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

const sortedPlayers = computed(() => props.players.sort((a, b) => sortPlayers(a.id, b.id, props.results)))

const tableData = computed(() => sortedPlayers.value.map((p, i) => ({
    rank: i + 1,
    name: p.name,
    wins: getWins(p.id, props.results),
    draws: getDraws(p.id, props.results),
    losses: getLosses(p.id, props.results),
    incomplete: isIncomplete(p.id, props.results),
})))

const rowClass = (data: any) => {
    return [
        {
            'bg-primary': !data.incomplete && data.rank === 1,
            'bg-gray-400': data.incomplete,
        },
    ]
}

const incompleteCount = tableData.value.filter(d => d.incomplete).length
</script>

<template>
    <h1 class="border-bottom-1">Results</h1>

    <DataTable :value="tableData" :rowClass="rowClass">
        <Column field="rank" header="#"></Column>
        <Column field="name" header="Name"></Column>
        <Column field="wins" header="Won"></Column>
        <Column field="draws" header="Drew"></Column>
        <Column field="losses" header="Lost"></Column>
    </DataTable>

    <h4 v-if="incompleteCount > 0">
        <em>{{ incompleteCount }} player(s) have incomplete results!</em>
    </h4>
</template>

<style scoped>
h3 {
    margin: 0px;
}
</style>
