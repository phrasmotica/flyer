<script setup lang="ts">
import { computed } from "vue"

import type { Result } from "../data/Result"

import { useFlyerStore } from "../stores/flyer"

const flyerStore = useFlyerStore()

const getWinner = (r: Result) => {
    if (!r.finishTime || isDraw(r)) {
        return null
    }

    const maxScore = r.scores.reduce((s, t) => s.score > t.score ? s : t)
    return maxScore.playerId
}

const isDraw = (r: Result) => {
    if (!r.finishTime) {
        return false
    }

    const maxScore = r.scores.map(s => s.score).reduce((x, y) => Math.max(x, y))
    return r.scores.every(s => s.score === maxScore)
}

const getLoser = (r: Result) => {
    if (!r.finishTime || isDraw(r)) {
        return null
    }

    const minScore = r.scores.reduce((s, t) => s.score < t.score ? s : t)
    return minScore.playerId
}

const getWins = (player: string, results: Result[]) => results.filter(r => getWinner(r) === player).length

const getDraws = (player: string, results: Result[]) => results.filter(r => isDraw(r) && r.scores.some(s => s.playerId === player)).length

const getLosses = (player: string, results: Result[]) => results.filter(r => getLoser(r) === player).length

const isIncomplete = (player: string, results: Result[]) => {
    return results.some(r => r.scores.some(s => s.playerId === player) && !r.finishTime)
}

const tableData = computed(() => {
    const data = flyerStore.players.map(p => ({
        name: p.name,
        wins: getWins(p.id, flyerStore.results),
        draws: getDraws(p.id, flyerStore.results),
        losses: getLosses(p.id, flyerStore.results),
        incomplete: isIncomplete(p.id, flyerStore.results),
    }))

    return data.sort((p, q) => {
        if (p.wins !== q.wins) {
            return q.wins - p.wins
        }

        if (p.losses !== q.losses) {
            return q.losses - p.losses
        }

        return 0
    })
})

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
    <DataTable :value="tableData" :rowClass="rowClass">
        <Column header="#">
            <template #body="slotProps">
                {{ slotProps.index + 1 }}
            </template>
        </Column>

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
