<script setup lang="ts">
import { computed, watch } from "vue"
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
} = useArray<Player>(nextTieBreaker.value?.players || [])

watch(nextTieBreaker, () => {
    finalOrder.value = nextTieBreaker.value?.players || []
})

const message = computed(() => t('results.pleaseConfirmPlayOffRanking', {
    name: nextTieBreaker.value?.name || t('playOff.unknownIndicator'),
}))
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
