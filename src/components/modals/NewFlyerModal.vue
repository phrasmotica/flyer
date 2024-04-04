<script setup lang="ts">
import ConfirmModal from "./ConfirmModal.vue"

const visible = defineModel<boolean>("visible", {
    default: false,
})

const emit = defineEmits<{
    confirm: []
    hide: []
}>()
</script>

<template>
    <ConfirmModal
        v-model:visible="visible"
        header="New flyer"
        message="Are you sure you want to start a new flyer? The current one has not been saved!"
        confirmLabel="Yes"
        :confirmDisabled="false"
        cancelLabel="No"
        @confirm="emit('confirm')"
        @hide="emit('hide')" />
</template>
