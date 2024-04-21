<script setup lang="ts">
import { computed, ref } from "vue"
import { useI18n } from "vue-i18n"
import type { DataTableExpandedRows } from "primevue/datatable"

import PlayerRecord from "./PlayerRecord.vue"

import { useFlyer } from "@/composables/useFlyer"
import { usePhaseSettings } from "@/composables/usePhaseSettings"
import { usePlayOffs } from "@/composables/usePlayOffs"
import { useScreenSizes } from "@/composables/useScreenSizes"

import type { PlayerRecord as TableData } from "@/data/PlayerRecord"

import { useFlyerStore } from "@/stores/flyer"

const { t } = useI18n()

const props = defineProps<{
    isInProgress?: boolean
    isPinned?: boolean
}>()

const { isNotSmallScreen } = useScreenSizes()

const flyerStore = useFlyerStore()

const {
    flyer,
    mainPhase,
    overallStandings,
    inseparablePlayers,
    unplayedTieBreakers,
    completedPlayOffs,
    hasAlreadyPlayedOff,
} = useFlyer(flyerStore.flyer)

const {
    isWinnerStaysOn,
    usesRunouts,
    fixturesCanBeDrawn,
} = usePhaseSettings(mainPhase.value)

const {
    playOffWasSkipped,
    getPlayOffRank,
} = usePlayOffs(flyer.value)

const expandedRows = ref(<DataTableExpandedRows>{})

const showRank = computed(() => true)
const showExpander = computed(() => !props.isPinned)
const showName = computed(() => true)
const showPlayed = computed(() => props.isInProgress && !props.isPinned)
const showWins = computed(() => !props.isPinned)
const showDraws = computed(() => fixturesCanBeDrawn.value && !props.isPinned)
const showLosses = computed(() => !isWinnerStaysOn.value && !props.isPinned)
const showRunouts = computed(() => usesRunouts.value && (isNotSmallScreen.value || isWinnerStaysOn.value) && !props.isPinned)
const showPoints = computed(() => !isWinnerStaysOn.value)
const showDiff = computed(() => !isWinnerStaysOn.value)
const showPlayOffRank = computed(() => completedPlayOffs.value.length > 0)

const getTieBreakerIndex = (playerId: string) => {
    // don't want to show tie-breakers where too many players have already
    // been drafted into a play-off
    const stillRelevantTieBreakers = unplayedTieBreakers.value.filter(t => {
        return t.players.filter(p => !hasAlreadyPlayedOff(p.id)).length > 1
    })

    return stillRelevantTieBreakers.findIndex(p => p.players.some(x => x.id === playerId)) + 1
}

const showTieBreakerIndex = (playerId: string) => {
    return !props.isPinned && !hasAlreadyPlayedOff(playerId) && getTieBreakerIndex(playerId) > 0
}

const rowClass = (data: TableData) => [
    {
        'bg-primary': !props.isInProgress && !data.incomplete && data.rank === 1,
        'incomplete-row': !props.isInProgress && data.incomplete,
        'tie-break-row': showTieBreakerIndex(data.playerId),
        'tie-break-unresolved-row': inseparablePlayers.value.includes(data.playerId),
    },
]
</script>

<template>
    <!-- LOW: ensure table does not need to scroll sideways on narrow screens -->
    <DataTable
        size="small" dataKey="playerId"
        v-model:expandedRows="expandedRows"
        :value="overallStandings"
        :rowClass="(data: TableData) => rowClass(data)">
        <Column v-if="showRank" field="rank" :header="t('results.rankHeader')" />

        <Column v-if="showExpander" expander class="w-1rem" />

        <Column v-if="showName" field="name" :header="t('results.nameHeader')">
            <template #body="{ data: record }">
                {{ record.name }}
                <span v-if="showTieBreakerIndex(record.playerId)">
                    <sup class="text-xs">{{ getTieBreakerIndex(record.playerId) }}</sup>
                </span>
            </template>
        </Column>

        <Column v-if="showPlayed" field="played" :header="t('results.playedHeader')" />

        <Column v-if="showWins" field="wins" :header="t('results.winsHeader')" />

        <Column v-if="showDraws" field="draws" :header="t('results.drawsHeader')" />

        <Column v-if="showLosses" field="losses" :header="t('results.lossesHeader')" />

        <Column v-if="showRunouts" field="runouts" :header="t('results.runoutsHeader')" />

        <Column v-if="showPoints" field="points" :header="t('results.pointsHeader')">
            <template #body="{ data: record }">
                <span class="font-bold">{{ record.points }}</span>
            </template>
        </Column>

        <Column v-if="showDiff" field="diff" :header="t('results.diffHeader')" />

        <Column v-if="showPlayOffRank" :header="t('results.playOffRankHeader')">
            <template #body="{ data: record }">
                <div v-if="playOffWasSkipped(record.playerId)" class="font-italic">
                    <span v-if="getPlayOffRank(record.playerId)">
                        {{ getPlayOffRank(record.playerId) }}
                    </span>
                    <span v-else>
                        {{ t('playOff.skippedAbbr') }}
                    </span>
                </div>
                <div v-else>
                    <span v-if="getPlayOffRank(record.playerId)">
                        {{ getPlayOffRank(record.playerId) }}
                    </span>
                    <span v-else>
                        {{ t('results.noPlayOffRank') }}
                    </span>
                </div>
            </template>
        </Column>

        <template #expansion="{ data: record }">
            <div class="cell-padding border-bottom-1" :class="rowClass(record)">
                <PlayerRecord :playerId="record.playerId" />
            </div>
        </template>
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

.p-datatable-tbody tr.p-datatable-row-expansion td {
    padding: 0;
}

.cell-padding {
    padding: 0.375rem 0.5rem;
}
</style>
