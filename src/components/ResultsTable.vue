<script setup lang="ts">
import { computed } from "vue"
import { useI18n } from "vue-i18n"

import WinningsList from "./WinningsList.vue"

import { useFlyer } from "../composables/useFlyer"
import { usePhase } from "../composables/usePhase"
import { usePhaseSettings } from "../composables/usePhaseSettings"
import { useQueryParams } from "../composables/useQueryParams"
import { useScreenSizes } from "../composables/useScreenSizes"

import { useFlyerStore } from "../stores/flyer"

const props = defineProps<{
    isInProgress?: boolean
    isPinned?: boolean
}>()

const { isNotSmallScreen } = useScreenSizes()

const { n } = useI18n()

const flyerStore = useFlyerStore()

const {
    mainPhase,
    overallStandings,
    playOffs,
    requiresPlayOff,
    completedPlayOffs,
    moneyRecipients,
    getPlayOffRank,
    phaseIsComplete,
} = useFlyer(flyerStore.flyer)

const {
    settings,
} = usePhase(mainPhase.value)

const {
    tieBreakerName,
    isWinnerStaysOn,
} = usePhaseSettings(settings.value)

const {
    isHistoric,
} = useQueryParams()

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
    return playOffs.value.filter(x => !phaseIsComplete(x.id)).findIndex(p => p.players.some(x => x.id === playerId))
}
</script>

<template>
    <!-- LOW: ensure table does not need to scroll sideways on narrow screens -->
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
        <Column v-if="props.isInProgress && !props.isPinned" field="played" header="P"></Column>
        <Column field="wins" header="W"></Column>
        <Column v-if="settings.allowDraws && !props.isPinned" field="draws" header="D"></Column>
        <Column v-if="!isWinnerStaysOn" field="losses" header="L"></Column>
        <Column v-if="!isWinnerStaysOn && !props.isPinned" field="diff" header="+/-"></Column>
        <Column v-if="(isNotSmallScreen || isWinnerStaysOn) && !props.isPinned" field="runouts" header="R/O"></Column>
        <Column v-if="completedPlayOffs.length > 0" header="P/O">
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
        <p v-for="p, i in playOffs.filter(x => !phaseIsComplete(x.id))" class="m-0">
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
                <sup class="text-xs">{{ i + 1 }}&nbsp;</sup>
                <span v-if="isHistoric">these players were tie-broken via {{ tieBreakerName }}</span>
                <span v-else>these players have been tie-broken via {{ tieBreakerName }}</span>
            </em>
        </p>
    </div>

    <!-- if the flyer has finished -->
    <div v-if="!props.isInProgress && (!requiresPlayOff || allPlayOffsComplete)" class="mt-1">
        <p v-if="overallStandings[0]" class="m-0 text-center text-xl">
            <span v-if="isHistoric">{{ overallStandings[0].name }} won&nbsp;</span>
            <span v-else>{{ overallStandings[0].name }} wins&nbsp;</span>
            <span v-if="moneyRecipients.length > 0" class="font-bold" :style="{color: moneyRecipients[0].colour,}">
                {{ n(moneyRecipients[0].winnings, "currency") }}
            </span>
        </p>

        <div v-if="moneyRecipients.length > 1" class="border-top-1 mt-1 pt-1">
            <WinningsList
                header="Other prize money:"
                :winnings="moneyRecipients.slice(1)" />
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
