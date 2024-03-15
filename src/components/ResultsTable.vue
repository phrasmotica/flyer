<script setup lang="ts">
import { computed } from "vue"
import { useI18n } from "vue-i18n"

import WinningsList from "./WinningsList.vue"

import { useFlyer } from "../composables/useFlyer"
import { usePlayOffs } from "../composables/usePlayOffs"
import { useScreenSizes } from "../composables/useScreenSizes"
import { useSettings } from "../composables/useSettings"
import { useStandings } from "../composables/useStandings"

import { useFlyerStore, usePlayOffStore } from "../stores/flyer"

const props = defineProps<{
    isInProgress?: boolean
    isPlayOff?: boolean
}>()

const { isNotSmallScreen } = useScreenSizes()

const { n } = useI18n()

const flyerStore = useFlyerStore()
const playOffStore = usePlayOffStore()

const {
    fixtures,
    players,
    settings,
    playOffs: playOffFlyers,
    playOffIsComplete,
} = useFlyer(flyerStore.flyer?.phases[0] || null)

const {
    fixtures: playOffFixtures,
    players: playOffPlayers,
    settings: playOffSettings,
} = useFlyer(playOffStore.flyer?.phases[0] || null)

const {
    playOffs: completedPlayOffs,
    somePlayOffComplete,
    getPlayOffRank,
    processStandings,
} = usePlayOffs(playOffFlyers.value)

const {
    tieBreakerName,
    isWinnerStaysOn,
} = useSettings(settings.value)

const {
    standings,
    playOffs,
    requiresPlayOff,
    moneyRecipients,
} = useStandings(fixtures.value, players.value, settings.value)

const {
    standings: currentPlayOffStandings,
} = useStandings(playOffFixtures.value, playOffPlayers.value, playOffSettings.value)

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

const allPlayOffsComplete = computed(() => completedPlayOffs.value.length >= playOffs.value.length)

const incompleteCount = computed(() => overallStandings.value.filter(d => d.incomplete).length)

const getPlayOffIndex = (playerId: string) => {
    return playOffs.value.filter(x => !playOffIsComplete(x.id)).findIndex(p => p.players.some(x => x.id === playerId))
}
</script>

<template>
    <!-- MEDIUM: ensure table does not need to scroll sideways on narrow screens -->
    <DataTable size="small" :value="overallStandings" :rowClass="rowClass">
        <Column header="#" field="rank"></Column>
        <Column field="name" header="Name">
            <template #body="slotData">
                {{ slotData.data.name }}
                <span v-if="!props.isInProgress && requiresPlayOff && !allPlayOffsComplete && getPlayOffIndex(slotData.data.playerId) >= 0">
                    <sup class="text-xs">{{ getPlayOffIndex(slotData.data.playerId) + 1 }}</sup>
                </span>
            </template>
        </Column>
        <Column v-if="props.isInProgress" field="played" header="P"></Column>
        <Column field="wins" header="W"></Column>
        <Column v-if="settings.allowDraws" field="draws" header="D"></Column>
        <Column v-if="!isWinnerStaysOn" field="losses" header="L"></Column>
        <Column v-if="!isWinnerStaysOn" field="diff" header="+/-"></Column>
        <Column v-if="isNotSmallScreen || isWinnerStaysOn" field="runouts" header="R/O"></Column>
        <Column v-if="somePlayOffComplete" header="P/O">
            <template #body="slotData">
                {{ getPlayOffRank(slotData.data.playerId) || "-" }}
            </template>
        </Column>
    </DataTable>

    <!-- if it was finished early -->
    <h4 v-if="!props.isInProgress && (incompleteCount > 0 && !isWinnerStaysOn)">
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
    <div v-if="!props.isInProgress && !requiresPlayOff && playOffs.length > 0 && !isWinnerStaysOn" class="mt-1">
        <p v-for="_, i in playOffs" class="m-0">
            <em>
                <sup class="text-xs">{{ i + 1 }}</sup>
                these players have been tie-broken via {{ tieBreakerName }}
            </em>
        </p>
    </div>

    <!-- if the flyer has finished -->
    <div v-if="!props.isInProgress && (!requiresPlayOff || allPlayOffsComplete)" class="mt-1">
        <p v-if="overallStandings[0]" class="m-0 text-center text-xl">
            {{ overallStandings[0].name }} wins
            <span v-if="moneyRecipients.length > 0" class="font-bold" :style="{color: moneyRecipients[0].colour,}">
                {{ n(moneyRecipients[0].winnings, "currency") }}
            </span>
        </p>

        <div v-if="moneyRecipients.length > 1" class="border-top-1 mt-1 pt-1">
            <WinningsList header="Other prize money:" :winnings="moneyRecipients.slice(1)" />
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
