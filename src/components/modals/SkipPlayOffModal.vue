<script setup lang="ts">
import { computed, onMounted, ref } from "vue"
import { useI18n } from "vue-i18n"

import ConfirmModal from "./ConfirmModal.vue"
import PlayerDropdown from "../results/PlayerDropdown.vue"

import { useFlyer } from "@/composables/useFlyer"
import { useStandings } from "@/composables/useStandings"

import { useFlyerStore } from "@/stores/flyer"

const { t } = useI18n()

const visible = defineModel<boolean>("visible", {
    default: false,
})

const emit = defineEmits<{
    confirmWinner: [playerId: string]
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

const defaultWinner = ref("")

const nextPlayOff = computed(() => {
    const remaining = orderedPlayOffs.value.filter(p => !phaseIsComplete(p.id))
    return remaining.length > 0 ? remaining[0] : null
})

const players = computed(() => nextPlayOff.value?.players || [])

const message = computed(() => t('results.pleaseChoosePlayOffWinner', {
    name: nextPlayOff.value?.name || t('playOff.unknownIndicator'),
}))

onMounted(() => {
    if (players.value[0]) {
        defaultWinner.value = players.value[0].id
    }
})
</script>

<template>
    <ConfirmModal
        v-model:visible="visible"
        :header="t('results.skipPlayOff')"
        :message="message"
        :confirmLabel="t('common.confirm')"
        :cancelLabel="t('common.cancel')"
        @confirm="emit('confirmWinner', defaultWinner)"
        @hide="emit('hide')">
        <div class="p-fluid mb-2">
            <PlayerDropdown v-model="defaultWinner" :players="players" />
        </div>
    </ConfirmModal>
</template>
