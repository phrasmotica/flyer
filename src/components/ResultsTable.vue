<script setup lang="ts">
import { computed } from "vue"

import { useCurrency } from "../composables/useCurrency"
import { useSettings } from "../composables/useSettings"

import type { Result } from "../data/Result"

import { useFlyerStore } from "../stores/flyer"

const props = defineProps<{
    isInProgress?: boolean
}>()

const { gbp } = useCurrency()

const flyerStore = useFlyerStore()

const {
    settings,
    prizeMonies,
} = useSettings(flyerStore.settings)

const winner = computed(() => flyerStore.winner)

const hasPlayed = (r: Result, playerId: string) => {
    if (!r.startTime || !r.finishTime) {
        return false
    }

    return r.scores.some(s => s.playerId === playerId)
}

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

const getPlayed = (player: string, results: Result[]) => results.filter(r => hasPlayed(r, player)).length

const getWins = (player: string, results: Result[]) => results.filter(r => getWinner(r) === player).length

const getDraws = (player: string, results: Result[]) => results.filter(r => isDraw(r) && r.scores.some(s => s.playerId === player)).length

const getLosses = (player: string, results: Result[]) => results.filter(r => getLoser(r) === player).length

const getFrameDifference = (playerId: string, results: Result[]) => {
    const played = results.filter(r => hasPlayed(r, playerId))
    return played.map(r => {
        const playerScore = r.scores.find(s => s.playerId === playerId)!
        const otherScore = r.scores.find(s => s.playerId !== playerId)!

        // assume a two-player match
        return playerScore.score - otherScore.score
    }).reduce((x, y) => x + y)
}

const isIncomplete = (player: string, results: Result[]) => {
    return results.some(r => r.scores.some(s => s.playerId === player) && !r.finishTime)
}

const tableData = computed(() => {
    const data = flyerStore.players.map(p => ({
        name: p.name,
        played: getPlayed(p.id, flyerStore.results),
        wins: getWins(p.id, flyerStore.results),
        draws: getDraws(p.id, flyerStore.results),
        losses: getLosses(p.id, flyerStore.results),
        diff: getFrameDifference(p.id, flyerStore.results),
        incomplete: isIncomplete(p.id, flyerStore.results),
    }))

    return data.sort((p, q) => {
        if (p.wins !== q.wins) {
            return q.wins - p.wins
        }

        if (p.losses !== q.losses) {
            return q.losses - p.losses
        }

        if (p.diff !== q.diff) {
            return q.diff - p.diff
        }

        // TODO: give 3 points for a win, 1 for a draw, etc?

        return 0
    }).map((p, i) => ({ rank: i + 1, ...p }))
})

const rowClass = (data: any) => {
    if (props.isInProgress) {
        return ""
    }

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
    <!-- TODO: ensure table does not need to scroll sideways on narrow screens -->
    <DataTable size="small" :value="tableData" :rowClass="rowClass">
        <Column header="#">
            <template #body="slotProps">
                {{ slotProps.index + 1 }}
            </template>
        </Column>

        <Column field="name" header="Name"></Column>
        <Column v-if="props.isInProgress" field="played" header="P"></Column>
        <Column field="wins" header="W"></Column>
        <Column v-if="settings.allowDraws" field="draws" header="D"></Column>
        <Column field="losses" header="L"></Column>
        <Column field="diff" header="+/-"></Column>
    </DataTable>

    <p v-if="winner && prizeMonies.length > 0" class="m-0 text-center text-xl">
        {{ winner.name }} wins
        <span class="font-bold">{{ gbp(prizeMonies[0]) }}</span>
    </p>

    <h4 v-if="!props.isInProgress && incompleteCount > 0">
        <em>{{ incompleteCount }} player(s) have incomplete results!</em>
    </h4>
</template>
