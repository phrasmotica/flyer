<script setup lang="ts">
import { computed } from "vue"
import { breakpointsPrimeFlex, useBreakpoints } from "@vueuse/core"

import { useCurrency } from "../composables/useCurrency"
import { useFlyer } from "../composables/useFlyer"
import { usePlayOffs } from "../composables/usePlayOffs"
import { useSettings } from "../composables/useSettings"
import { useStandings } from "../composables/useStandings"

import { useFlyerStore, usePlayOffStore } from "../stores/flyer"

const props = defineProps<{
    isInProgress?: boolean
    isPlayOff?: boolean
}>()

const { greaterOrEqual } = useBreakpoints(breakpointsPrimeFlex)

const { gbp } = useCurrency()

const flyerStore = useFlyerStore()
const playOffStore = usePlayOffStore()

const {
    results,
    players,
    settings,
    playOffs: playOffFlyers,
    playOffIsComplete,
} = useFlyer(flyerStore.flyer)

const {
    results: playOffResults,
    players: playOffPlayers,
    settings: playOffSettings,
} = useFlyer(playOffStore.flyer) // TODO: generate play-off flyer before we get here, so that it's not null/undefined

const {
    playOffs: completedPlayOffs,
    somePlayOffComplete,
    getPlayOffRank,
    processStandings,
} = usePlayOffs(playOffFlyers.value)

const {
    prizeMonies,
} = useSettings(settings.value)

const {
    standings,
    playOffs,
    requiresPlayOff,
} = useStandings(results.value, players.value, settings.value)

const {
    standings: currentPlayOffStandings,
} = useStandings(playOffResults.value, playOffPlayers.value, playOffSettings.value)

const overallStandings = computed(() => {
    if (props.isPlayOff) {
        return currentPlayOffStandings.value
    }

    return processStandings(standings.value)
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

// TODO: encapsulate these computed properties in some composable
const allPlayOffsComplete = computed(() => completedPlayOffs.value.length >= playOffs.value.length)

const incompleteCount = computed(() => overallStandings.value.filter(d => d.incomplete).length)

const isNotSmall = computed(() => greaterOrEqual("md").value)

const getPlayOffIndex = (playerId: string) => {
    return playOffs.value.filter(x => !playOffIsComplete(x.id)).findIndex(p => p.players.some(x => x.id === playerId))
}
</script>

<template>
    <!-- TODO: ensure table does not need to scroll sideways on narrow screens -->
    <DataTable size="small" :value="overallStandings" :rowClass="rowClass">
        <Column header="#" field="rank"></Column>
        <Column field="name" header="Name">
            <template #body="slotData">
                {{ slotData.data.name }}
                <span v-if="!props.isInProgress && !allPlayOffsComplete && getPlayOffIndex(slotData.data.playerId) >= 0">
                    <sup class="text-xs">{{ getPlayOffIndex(slotData.data.playerId) + 1 }}</sup>
                </span>
            </template>
        </Column>
        <Column v-if="props.isInProgress" field="played" header="P"></Column>
        <Column field="wins" header="W"></Column>
        <Column v-if="settings.allowDraws" field="draws" header="D"></Column>
        <Column field="losses" header="L"></Column>
        <Column field="diff" header="+/-"></Column>
        <Column v-if="isNotSmall" field="runouts" header="R/O"></Column>
        <Column v-if="somePlayOffComplete" header="P/O">
            <template #body="slotData">
                {{ getPlayOffRank(slotData.data.playerId) || "-" }}
            </template>
        </Column>
    </DataTable>

    <!-- if it was finished early -->
    <h4 v-if="!props.isInProgress && incompleteCount > 0">
        <em>{{ incompleteCount }} player(s) have incomplete results!</em>
    </h4>

    <!-- if a play-off needs to happen -->
    <div v-if="!props.isInProgress && requiresPlayOff && !allPlayOffsComplete && playOffs.length > 0" class="mt-1">
        <p v-for="p, i in playOffs.filter(x => !playOffIsComplete(x.id))" class="m-0">
            <em>
                <sup class="text-xs">{{ i + 1 }}</sup>
                these players must take part in the
                {{ p.name }}
            </em>
        </p>
    </div>

    <!-- if some players have been tie-broken -->
    <div v-if="!props.isInProgress && !requiresPlayOff && playOffs.length > 0" class="mt-1">
        <p v-for="_, i in playOffs" class="m-0">
            <em>
                <sup class="text-xs">{{ i + 1 }}</sup>
                these players have been tie-broken via {{ settings.tieBreaker }}
            </em>
        </p>
    </div>

    <!-- if the flyer has finished -->
    <div v-if="!props.isInProgress && (!requiresPlayOff || allPlayOffsComplete)" class="mt-1">
        <p v-if="overallStandings[0]" class="m-0 text-center text-xl">
            {{ overallStandings[0].name }} wins
            <span v-if="prizeMonies.length > 0" class="font-bold">
                {{ gbp(prizeMonies[0]) }}
            </span>
        </p>

        <div v-if="prizeMonies.length > 1" class="border-top-1 mt-1 pt-1">
            <p class="m-0">
                Other prize money:
                <span v-for="_, i in prizeMonies.slice(1)">
                    <span v-if="i > 0">, </span>
                    {{ overallStandings[i + 1].name }} wins
                    <span class="font-bold">
                        {{ gbp(prizeMonies[i + 1]) }}
                    </span>
                </span>
            </p>
        </div>
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
