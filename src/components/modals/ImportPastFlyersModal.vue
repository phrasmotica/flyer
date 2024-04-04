<script setup lang="ts">
import ConfirmModal from "./ConfirmModal.vue"

const text = defineModel<string>("text", {
    default: "",
})

const visible = defineModel<boolean>("visible", {
    default: false,
})

const emit = defineEmits<{
    hide: []
    importPastFlyers: []
}>()
</script>

<template>
    <ConfirmModal
        v-model:visible="visible"
        header="Import data"
        message="Please paste flyer data here:"
        confirmLabel="Import"
        :confirmDisabled="false"
        cancelLabel="Cancel"
        @confirm="emit('importPastFlyers')"
        @hide="emit('hide')">
        <div class="p-fluid">
            <Textarea v-model="text" />
        </div>
    </ConfirmModal>
</template>
