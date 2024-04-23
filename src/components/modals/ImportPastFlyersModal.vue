<script setup lang="ts">
import { useI18n } from "vue-i18n"

import ConfirmModal from "./ConfirmModal.vue"

const { t } = useI18n()

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
        :header="t('history.importData')"
        :message="t('history.pleasePasteData')"
        :confirmLabel="t('history.import')"
        :confirmDisabled="!text"
        :cancelLabel="t('common.cancel')"
        @confirm="emit('importPastFlyers')"
        @hide="emit('hide')">
        <div class="p-fluid">
            <Textarea v-model="text" />
        </div>
    </ConfirmModal>
</template>
