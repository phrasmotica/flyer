<script setup lang="ts">
import { computed } from "vue"
import { useI18n } from "vue-i18n"

import ConfirmModal from "./ConfirmModal.vue"
import TableInput from "../setup/TableInput.vue"

const { t } = useI18n()

const visible = defineModel<boolean>("visible", {
    default: false,
})

const newTableName = defineModel<string>("name")
const newTableCost = defineModel<number>("cost")

const emit = defineEmits<{
    confirm: []
    hide: []
}>()

const canAdd = computed(() => !!newTableName.value)

const addNewTable = () => {
    if (!canAdd) {
        return
    }

    emit('confirm')
}
</script>

<template>
    <ConfirmModal
        v-model:visible="visible"
        :header="t('play.addNewTable')"
        message=""
        :confirmLabel="t('common.add')"
        :confirmDisabled="!canAdd"
        :cancelLabel="t('common.cancel')"
        @confirm="addNewTable"
        @hide="emit('hide')">
        <TableInput
            v-model:name="newTableName"
            v-model:cost="newTableCost" />
    </ConfirmModal>
</template>
