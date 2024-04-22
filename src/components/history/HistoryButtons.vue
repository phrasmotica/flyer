<script setup lang="ts">
import { computed } from "vue"
import { useI18n } from "vue-i18n"

import { useFlyerHistoryStore } from "@/stores/flyerHistory"

const props = defineProps<{
    isImported: boolean
    isExported: boolean
}>()

const emit = defineEmits<{
    exportPastFlyers: []
    showImportModal: []
}>()

const { t } = useI18n()

const flyerHistoryStore = useFlyerHistoryStore()

const importButtonLabel = computed(() => {
    return props.isImported ? t("history.dataImported") : t("history.importData")
})

const exportButtonLabel = computed(() => props.isExported ? t("history.dataExported") : t("history.exportData"))
</script>

<template>
    <div class="p-fluid">
        <Button
            class="mb-2"
            :label="importButtonLabel"
            :disabled="isImported"
            severity="primary"
            @click="emit('showImportModal')" />

        <Button
            :label="exportButtonLabel"
            :disabled="flyerHistoryStore.noHistory || isExported"
            severity="primary"
            @click="emit('exportPastFlyers')" />
    </div>
</template>
