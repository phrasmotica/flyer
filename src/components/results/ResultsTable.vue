<script setup lang="ts">
import { computed } from "vue"
import { useI18n } from "vue-i18n"

import { useFlyer } from "@/composables/useFlyer"
import { usePhase } from "@/composables/usePhase"
import { usePhaseSettings } from "@/composables/usePhaseSettings"
import { useScreenSizes } from "@/composables/useScreenSizes"

import { useFlyerStore } from "@/stores/flyer"

const { t } = useI18n()

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
            'play-off-row': showPlayOffIndex(data.playerId),
            'incomplete-row': data.incomplete,
        },
    ]
}

const getPlayOffIndex = (playerId: string) => {
    const incompletePlayOffs = playOffs.value.filter(x => !phaseIsComplete(x.id))
    return incompletePlayOffs.findIndex(p => p.players.some(x => x.id === playerId))
}

const showRank = computed(() => true)
const showName = computed(() => true)
const showPlayed = computed(() => props.isInProgress && !props.isPinned)
const showWins = computed(() => true)
const showDraws = computed(() => settings.value.allowDraws && !props.isPinned)
const showLosses = computed(() => !isWinnerStaysOn.value)
const showDiff = computed(() => !isWinnerStaysOn.value && !props.isPinned)
const showRunouts = computed(() => (isNotSmallScreen.value || isWinnerStaysOn.value) && !props.isPinned)
const showPlayOffRank = computed(() => completedPlayOffs.value.length > 0)

const showPlayOffIndex = (playerId: string) => {
    return !props.isInProgress && !allPlayOffsComplete.value && getPlayOffIndex(playerId) >= 0
}
</script>

<template>
    <!-- LOW: ensure table does not need to scroll sideways on narrow screens -->
    <DataTable size="small" :value="overallStandings" :rowClass="rowClass">
        <Column v-if="showRank" field="rank" :header="t('results.rankHeader')" />

        <Column v-if="showName" field="name" :header="t('results.nameHeader')">
            <template #body="slotData">
                {{ slotData.data.name }}
                <span v-if="showPlayOffIndex(slotData.data.playerId)">
                    <sup class="text-xs">{{ getPlayOffIndex(slotData.data.playerId) + 1 }}</sup>
                </span>
            </template>
        </Column>

        <Column v-if="showPlayed" field="played" :header="t('results.playedHeader')" />

        <Column v-if="showWins" field="wins" :header="t('results.winsHeader')" />

        <Column v-if="showDraws" field="draws" :header="t('results.drawsHeader')" />

        <Column v-if="showLosses" field="losses" :header="t('results.lossesHeader')" />

        <Column v-if="showDiff" field="diff" :header="t('results.diffHeader')" />

        <Column v-if="showRunouts" field="runouts" :header="t('results.runoutsHeader')" />

        <Column v-if="showPlayOffRank" :header="t('results.playOffRankHeader')">
            <template #body="slotData">
                {{ getPlayOffRank(slotData.data.playerId) || t('results.noPlayOffRank') }}
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
