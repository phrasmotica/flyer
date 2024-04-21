<script setup lang="ts">
import { computed, onMounted } from "vue"
import { useI18n } from "vue-i18n"

import ConfirmModal from "./ConfirmModal.vue"
import PlayerRanker from "../results/PlayerRanker.vue"

import { useArray } from "@/composables/useArray"
import { useFlyer } from "@/composables/useFlyer"
import { useStandings } from "@/composables/useStandings"

import type { Player } from "@/data/Player"

import { useFlyerStore } from "@/stores/flyer"

const { t } = useI18n()

const visible = defineModel<boolean>("visible", {
    default: false,
})

const emit = defineEmits<{
    confirmRanking: [players: Player[]]
    hide: []
}>()

const flyerStore = useFlyerStore()

const {
    mainPhase,
    phaseIsComplete,
} = useFlyer(flyerStore.flyer)

const {
    orderedPlayOffs,
} = useStandings(mainPhase.value)

const {
    arr: finalOrder,
} = useArray<Player>()

const nextPlayOff = computed(() => {
    const remaining = orderedPlayOffs.value.filter(p => !phaseIsComplete(p.id))
    return remaining.length > 0 ? remaining[0] : null
})

const players = computed(() => nextPlayOff.value?.players || [])

const message = computed(() => t('results.pleaseConfirmPlayOffRanking', {
    name: nextPlayOff.value?.name || t('playOff.unknownIndicator'),
}))

// BUG: final order is not refreshed when skipping a second play-off, after
// modal has already been used to skip a prior play-off
onMounted(() => {
    finalOrder.value = players.value
})
</script>

<template>
    <ConfirmModal
        v-model:visible="visible"
        :header="t('results.skipPlayOff')"
        :message="message"
        :confirmLabel="t('common.confirm')"
        :cancelLabel="t('common.cancel')"
        @confirm="emit('confirmRanking', finalOrder)"
        @hide="emit('hide')">
        <PlayerRanker v-model="finalOrder" />
    </ConfirmModal>
</template>
