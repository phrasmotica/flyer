<script setup lang="ts">
import { computed } from "vue"

import { useCurrency } from "../composables/useCurrency"
import { useSettings } from "../composables/useSettings"
import { useStandings } from "../composables/useStandings"

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

const {
    tableData,
    tieBrokenPlayers,
} = useStandings(flyerStore.results, flyerStore.players, flyerStore.settings)

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
        <Column header="#" field="rank"></Column>
        <Column field="name" header="Name"></Column>
        <Column v-if="props.isInProgress" field="played" header="P"></Column>
        <Column field="wins" header="W"></Column>
        <Column v-if="settings.allowDraws" field="draws" header="D"></Column>
        <Column field="losses" header="L"></Column>
        <Column field="diff" header="+/-"></Column>
    </DataTable>

    <h4 v-if="!props.isInProgress && incompleteCount > 0">
        <em>{{ incompleteCount }} player(s) have incomplete results!</em>
    </h4>

    <p v-if="tieBrokenPlayers.length > 1" class="m-0">
        <!-- TODO: put asterisks next to names of players that have been tie-broken -->
        <em>{{ tieBrokenPlayers.length }} player(s) have been tie-broken via {{ flyerStore.settings.tieBreaker }}</em>
    </p>

    <p v-if="winner && prizeMonies.length > 0" class="m-0 text-center text-xl">
        {{ winner.name }} wins
        <span class="font-bold">{{ gbp(prizeMonies[0]) }}</span>
    </p>
</template>
