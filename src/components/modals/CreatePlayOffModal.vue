<script setup lang="ts">
import { computed } from "vue"
import { useI18n } from "vue-i18n"

import ConfirmModal from "./ConfirmModal.vue"

import { useArray } from "@/composables/useArray"
import { useFlyer } from "@/composables/useFlyer"
import { usePhaseSettings } from "@/composables/usePhaseSettings"
import { usePlayers } from "@/composables/usePlayers"

import { useFlyerStore } from "@/stores/flyer"
import type { PlayerRecord } from "@/data/PlayerRecord"

const { t } = useI18n()

const visible = defineModel<boolean>("visible", {
    default: false,
})

const emit = defineEmits<{
    hide: []
    create: [records: PlayerRecord[]]
}>()

const flyerStore = useFlyerStore()

const {
    mainPhase,
    overallStandings,
} = useFlyer(flyerStore.flyer)

const {
    fixturesCanBeDrawn,
} = usePhaseSettings(mainPhase.value)

const {
    getPlayer,
} = usePlayers(mainPhase.value)

const {
    arr: playerIds,
} = useArray<string>()

// HIGH: disable options for players who've already been in a play-off
const options = computed(() => overallStandings.value.map(s => {
    const record = [s.wins, s.draws, s.losses]
    if (!fixturesCanBeDrawn.value) {
        record.splice(1, 1)
    }

    return {
        ...getPlayer(s.playerId)!,
        record: record.join("-"),
    }
}))

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
        @confirm="emit('create', selectedRecords)"
        @hide="emit('hide')">
        <div class="p-fluid mb-2">
            <p class="m-0 font-bold">
                {{ t('playOff.selectPlayers') }}
            </p>

            <Listbox
                multiple
                v-model="playerIds"
                :options="options"
                optionValue="id">
                <template #option="{ index, option: player }">
                    <div class="flex align-items-center">
                        <div class="mr-2">
                            <span class="text-right text-sm text-color-secondary font-italic w-1rem">
                                #{{ index + 1 }}
                            </span>
                        </div>
                        <span class="flex-grow-1">
                            {{ player.name }}
                        </span>
                        <div class="ml-2">
                            <span class="text-right text-sm text-color-secondary font-italic w-1rem">
                                {{ player.record }}
                            </span>
                        </div>
                    </div>
                </template>
            </Listbox>
        </div>
    </ConfirmModal>
</template>
