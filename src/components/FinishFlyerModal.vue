<script setup lang="ts">
import ConfirmModal from "../components/ConfirmModal.vue"

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
        header="Finish Flyer"
        message="Are you ready to finish the flyer?"
        confirmLabel="Yes"
        :confirmDisabled="false"
        cancelLabel="No"
        @confirm="emit('confirm')"
        @hide="emit('hide')" />
</template>
