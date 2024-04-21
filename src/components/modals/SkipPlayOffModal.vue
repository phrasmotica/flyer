<script setup lang="ts">
import { computed, onMounted } from "vue"
import { useI18n } from "vue-i18n"

import ConfirmModal from "./ConfirmModal.vue"
import PlayerRanker from "../results/PlayerRanker.vue"

import { useArray } from "@/composables/useArray"
import { useFlyer } from "@/composables/useFlyer"

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
    nextTieBreaker,
} = useFlyer(flyerStore.flyer)

const {
    arr: finalOrder,
} = useArray<Player>()

const players = computed(() => nextTieBreaker.value?.players || [])

const message = computed(() => t('results.pleaseConfirmPlayOffRanking', {
    name: nextTieBreaker.value?.name || t('playOff.unknownIndicator'),
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
