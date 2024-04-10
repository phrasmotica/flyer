<script setup lang="ts">
import { computed, watch } from "vue"
import { useI18n } from "vue-i18n"

import ConfirmModal from "./ConfirmModal.vue"

import { useFlyer } from "@/composables/useFlyer"

import type { Flyer } from "@/data/Flyer"

const { t } = useI18n()

const visible = defineModel<boolean>("visible", {
    default: false,
})

const props = defineProps<{
    selectedFlyer: Flyer | null
}>()

const emit = defineEmits<{
    confirm: []
    hide: []
}>()

const {
    flyer,
    mainPhase,
} = useFlyer(props.selectedFlyer)

watch(props, () => {
    flyer.value = props.selectedFlyer
})

const deleteMessage = computed(() => {
    if (!mainPhase.value) {
        return ""
    }

    return t('history.deleteAreYouSure', {
        name: mainPhase.value.settings.name
    })
})
</script>

<template>
    <ConfirmModal
        v-model:visible="visible"
        :header="t('history.deleteFlyer')"
        :message="deleteMessage"
        @confirm="emit('confirm')"
        @hide="emit('hide')" />
</template>
