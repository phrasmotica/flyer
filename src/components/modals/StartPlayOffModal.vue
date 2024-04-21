<script setup lang="ts">
import { computed } from "vue"
import { useI18n } from "vue-i18n"

import ConfirmModal from "./ConfirmModal.vue"

import { useFlyer } from "@/composables/useFlyer"

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
    nextTieBreaker,
} = useFlyer(flyerStore.flyer)

const message = computed(() => t('results.startPlayOffName', {
    name: nextTieBreaker.value?.name || t('playOff.unknownIndicator'),
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
