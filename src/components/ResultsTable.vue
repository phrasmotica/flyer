<script setup lang="ts">
import { useFlyer } from "../composables/useFlyer"
import { usePhase } from "../composables/usePhase"
import { usePhaseSettings } from "../composables/usePhaseSettings"
import { useScreenSizes } from "../composables/useScreenSizes"

import { useFlyerStore } from "../stores/flyer"

const props = defineProps<{
    isInProgress?: boolean
    isPinned?: boolean
}>()

const { isNotSmallScreen } = useScreenSizes()

const flyerStore = useFlyerStore()

const {
    mainPhase,
    overallStandings,
    playOffs,
    completedPlayOffs,
    allPlayOffsComplete,
    getPlayOffRank,
    phaseIsComplete,
} = useFlyer(flyerStore.flyer)

const {
    settings,
} = usePhase(mainPhase.value)

const {
    isWinnerStaysOn,
} = usePhaseSettings(settings.value)

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
