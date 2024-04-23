<script setup lang="ts">
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
</script>

<template>
    <div class="p-fluid">
        <Button
            class="mb-2"
            :label="t('history.importData')"
            :disabled="props.isImported"
            @click="emit('showImportModal')" />

        <Button
            :label="t('history.exportData')"
            :disabled="flyerHistoryStore.noHistory || props.isExported"
            @click="emit('exportPastFlyers')" />
    </div>
</template>
