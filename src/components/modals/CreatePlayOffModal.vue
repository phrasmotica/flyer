<script setup lang="ts">
import { computed, ref } from "vue"
import { useI18n } from "vue-i18n"

import ConfirmModal from "./ConfirmModal.vue"
import PlayerSelector from "../results/PlayerSelector.vue"
import Stepper from "../setup/Stepper.vue"

import { useArray } from "@/composables/useArray"
import { useFlyer } from "@/composables/useFlyer"

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
    arr: playerIds,
} = useArray<string>()

const raceTo = ref(1)

const selectedRecords = computed(() => overallStandings.value.filter(s => {
    return playerIds.value.includes(s.playerId)
}))
</script>

<template>
    <ConfirmModal
        style="width: min(80vw, 400px);"
        v-model:visible="visible"
        :header="t('results.createPlayOff')"
        :confirmLabel="t('common.create')"
        :confirmDisabled="playerIds.length <= 0"
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

            <PlayerSelector v-model="playerIds" />
        </div>
    </ConfirmModal>
</template>
