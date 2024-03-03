<script setup lang="ts">
import { computed } from "vue"
import { breakpointsPrimeFlex, useBreakpoints } from "@vueuse/core"

import { useCurrency } from "../composables/useCurrency"
import { useSettings } from "../composables/useSettings"
import { useStandings } from "../composables/useStandings"

import { useFlyerStore } from "../stores/flyer"

const props = defineProps<{
    isInProgress?: boolean
}>()

const { greaterOrEqual } = useBreakpoints(breakpointsPrimeFlex)

const { gbp } = useCurrency()

const flyerStore = useFlyerStore()

const {
    settings,
    prizeMonies,
} = useSettings(flyerStore.settings)

const {
    standings,
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

const tableData = computed(() => standings.value.tableData)
const tieBrokenPlayers = computed(() => standings.value.tieBrokenPlayers)

const incompleteCount = tableData.value.filter(d => d.incomplete).length

const isMedium = computed(() => greaterOrEqual("md").value)
</script>

<template>
    <!-- TODO: ensure table does not need to scroll sideways on narrow screens -->
    <DataTable size="small" :value="tableData" :rowClass="rowClass">
        <Column header="#" field="rank"></Column>
        <Column field="name" header="Name">
            <template #body="slotData">
                {{ slotData.data.name }}
                <span v-if="tieBrokenPlayers.includes(slotData.data.playerId)">*</span>
            </template>
        </Column>
        <Column v-if="props.isInProgress" field="played" header="P"></Column>
        <Column field="wins" header="W"></Column>
        <Column v-if="settings.allowDraws" field="draws" header="D"></Column>
        <Column field="losses" header="L"></Column>
        <Column field="diff" header="+/-"></Column>
        <Column v-if="isMedium" field="runouts" header="R/O"></Column>
    </DataTable>

    <h4 v-if="!props.isInProgress && incompleteCount > 0">
        <em>{{ incompleteCount }} player(s) have incomplete results!</em>
    </h4>

    <p v-if="tieBrokenPlayers.length > 1" class="m-0">
        <!-- TODO: remove this? Unnecessary if we have all the data in the table... -->
        <em>* these players have been tie-broken via {{ flyerStore.settings.tieBreaker }}</em>
    </p>

    <p v-if="tableData[0] && prizeMonies.length > 0" class="m-0 text-center text-xl">
        {{ tableData[0].name }} wins
        <span class="font-bold">{{ gbp(prizeMonies[0]) }}</span>
    </p>

    <div v-if="prizeMonies.length > 1" class="border-top-1 mt-1 pt-1">
        <p class="m-0">
            Other prize money:
            <span v-for="_, i in prizeMonies.slice(1)">
                <span v-if="i > 0">, </span>
                {{ tableData[i + 1].name }} wins
                <span class="font-bold">
                    {{ gbp(prizeMonies[i + 1]) }}
                </span>
            </span>
        </p>
    </div>
</template>

<style>
.p-datatable-thead th {
    transition: color 0.5s, background-color 0.5s;
    color: var(--color-text);
    background-color: var(--color-background)!important;
}

.p-datatable-tbody td {
    transition: color 0.5s, background-color 0.5s;
    color: var(--color-text);
    background-color: var(--color-background)!important;
}
</style>
