<script setup lang="ts">
import { computed, ref } from "vue"

import ConfirmModal from "./ConfirmModal.vue"
import TableInput from "../TableInput.vue"

const visible = defineModel<boolean>("visible", {
    default: false,
})

const emit = defineEmits<{
    confirm: []
    hide: []
}>()

const newTableName = ref("Table X")
const newTableCost = ref(9)

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
        header="Add new table"
        message=""
        confirmLabel="Add"
        :confirmDisabled="!canAdd"
        cancelLabel="Cancel"
        @confirm="addNewTable"
        @hide="emit('hide')">
        <TableInput
            v-model:name="newTableName"
            v-model:cost="newTableCost" />
    </ConfirmModal>
</template>
