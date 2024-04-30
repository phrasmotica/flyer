<script setup lang="ts">
import { computed, ref, watch } from "vue"
import { useI18n } from "vue-i18n"

import PlayerSelector from "../results/PlayerSelector.vue"
import Stepper from "../setup/Stepper.vue"
import ConfirmModal from "./ConfirmModal.vue"

import { useArray } from "@/composables/useArray"
import { useFlyer } from "@/composables/useFlyer"
import { useRankings } from "@/composables/useRankings"

import type { PlayerRecord } from "@/data/PlayerRecord"

import { useFlyerStore } from "@/stores/flyer"

const { t } = useI18n()

const visible = defineModel<boolean>("visible", {
    default: false,
})

const emit = defineEmits<{
    hide: []
    create: [records: PlayerRecord[], raceTo: number]
}>()

const flyerStore = useFlyerStore()

const {
    overallStandings,
} = useFlyer(flyerStore.flyer)

const {
    canPlayOff,
} = useRankings()

const {
    arr: playerIds,
} = useArray<string>()

const raceTo = ref(1)

watch(playerIds, () => {
    if (playerIds.value.length === 1) {
        // select all the other players with the same record
        const theirRecord = overallStandings.value.find(s => s.playerId === playerIds.value[0])!

        const otherPlayers = overallStandings.value.filter(s => {
            // MEDIUM: move this logic into composable, deduplicate in PlayerSelector.vue
            return s.wins === theirRecord.wins
                && s.draws === theirRecord.draws
                && s.losses === theirRecord.losses
        }).map(s => s.playerId)

        playerIds.value = [...playerIds.value, ...otherPlayers]
    }
})

const selectedRecords = computed(() => overallStandings.value.filter(s => {
    return playerIds.value.includes(s.playerId)
}))

const canCreate = computed(() => canPlayOff(selectedRecords.value))
</script>

<template>
    <ConfirmModal
        style="width: min(80vw, 400px);"
        v-model:visible="visible"
        :header="t('results.createPlayOff')"
        :confirmLabel="t('common.create')"
        :confirmDisabled="!canCreate"
        :cancelLabel="t('common.cancel')"
        @confirm="emit('create', selectedRecords, raceTo)"
        @hide="emit('hide')">
        <div class="p-fluid mb-2">
            <div class="mb-2">
                <Stepper
                    inputId="matchLengthStepper"
                    v-model="raceTo"
                    :min="1" :max="3"
                    :prefix="t('matchLengthModel.raceToPrefix')" />
            </div>

            <p class="m-0 font-bold">
                {{ t('playOff.selectPlayers') }}
            </p>

            <!-- HIGH: if there's money on the line between some players,
            show some appropriate icon next to their W/D/L records -->
            <PlayerSelector
                class="overflow-y-auto"
                style="height: 200px;"
                v-model="playerIds" />
        </div>
    </ConfirmModal>
</template>
