<script setup lang="ts">
import { computed } from "vue"
import { useI18n } from "vue-i18n"

import ConfirmModal from "./ConfirmModal.vue"

import { useFlyer } from "@/composables/useFlyer"
import { useStandings } from "@/composables/useStandings"

import { useFlyerStore } from "@/stores/flyer"

const { t } = useI18n()

const visible = defineModel<boolean>("visible", {
    default: false,
})

const emit = defineEmits<{
    confirm: []
    hide: []
}>()

const flyerStore = useFlyerStore()

const {
    mainPhase,
    phaseIsComplete,
} = useFlyer(flyerStore.flyer)

const {
    orderedTieBreakers,
} = useStandings(mainPhase.value)

// HIGH: put this inside useFlyer() and consume it in all the other places too
const nextPlayOff = computed(() => {
    const remaining = orderedTieBreakers.value.filter(p => !phaseIsComplete(p.id))
    return remaining.length > 0 ? remaining[0] : null
})

const message = computed(() => t('results.startPlayOffName', {
    name: nextPlayOff.value?.name || t('playOff.unknownIndicator'),
}))
</script>

<template>
    <ConfirmModal
        v-model:visible="visible"
        :header="t('results.startPlayOff')"
        :message="message"
        @confirm="emit('confirm')"
        @hide="emit('hide')" />
</template>
