<script setup lang="ts">
import { computed } from "vue"

const props = defineProps<{
    isImported: boolean
    failedToImport: boolean
    isExported: boolean
}>()

const emit = defineEmits<{
    exportPastFlyers: []
    showImportModal: []
}>()

const importButtonLabel = computed(() => {
    // MEDIUM: don't show the failed to import message here. Notify the user
    // elsewhere, e.g. in a toast message
    if (props.failedToImport) {
        return "Failed to import from clipboard!"
    }

    return props.isImported ? "Data imported from clipboard!" : "Import data"
})

const exportButtonLabel = computed(() => props.isExported ? "Data copied to clipboard!" : "Export data")
</script>

<template>
    <div class="p-fluid">
        <Button
            class="mb-2"
            :label="importButtonLabel"
            :disabled="failedToImport || isImported"
            severity="primary"
            @click="emit('showImportModal')" />

        <Button
            :label="exportButtonLabel"
            :disabled="isExported"
            severity="primary"
            @click="emit('exportPastFlyers')" />
    </div>
</template>
