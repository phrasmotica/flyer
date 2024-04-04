<script setup lang="ts">
import { computed, watch } from "vue"

import ConfirmModal from "./ConfirmModal.vue"

import { useFlyer } from "../../composables/useFlyer"

import type { Flyer } from "../../data/Flyer"

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

    return `Are you sure you want to delete ${mainPhase.value.settings.name}? This cannot be undone!`
})
</script>

<template>
    <ConfirmModal
        v-model:visible="visible"
        header="Delete flyer"
        :message="deleteMessage"
        confirmLabel="Yes"
        :confirmDisabled="false"
        cancelLabel="No"
        @confirm="emit('confirm')"
        @hide="emit('hide')" />
</template>
