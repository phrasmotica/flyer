<script setup lang="ts">
import { computed, ref } from "vue"
import { useI18n } from "vue-i18n"
import { useToggle } from "@vueuse/core"

import ConfirmModal from "./ConfirmModal.vue"
import TableBadge from "./TableBadge.vue"
import TableInput from "./TableInput.vue"

import { useFlyer } from "../composables/useFlyer"
import { usePhase } from "../composables/usePhase"
import { useSettings } from "../composables/useSettings"

import { useFlyerStore } from "../stores/flyer"

const props = defineProps<{
    isInProgress?: boolean
}>()

const { n } = useI18n()

const flyerStore = useFlyerStore()

const newTableName = ref("Table X")
const newTableCost = ref(9)

const [showAddTableModal, setShowAddTableModal] = useToggle(false)

const {
    currentPhase,
} = useFlyer(flyerStore.flyer)

const {
    settings,
    tables,
} = usePhase(currentPhase.value)

const {
    maxTableCount,
} = useSettings(settings.value)

const maxTablesReached = computed(() => tables.value.length >= maxTableCount.value)

const canAdd = computed(() => !!newTableName.value)

const addNewTable = () => {
    if (!canAdd.value) {
        return
    }

    flyerStore.addTable(newTableName.value, newTableCost.value)

    setShowAddTableModal(false)
}
</script>

<template>
    <div v-if="currentPhase">
        <div class="p-fluid">
            <div v-for="_, i in currentPhase.tables">
                <div class="flex" :class="i > 0 && 'mt-1 pt-1 border-none border-top-1 border-dashed border-gray-200'">
                    <div class="flex-grow-1">
                        <TableBadge :tableId="currentPhase.tables[i].id" />

                        <p class="m-0">
                            {{ n(currentPhase.tables[i].costPerHour, "currency") }} per hour
                        </p>

                        <!-- MEDIUM: indicate which fixture is being played on the table,
                        and allow opening the fixture modal -->
                    </div>

                    <!-- MEDIUM: allow pausing (deactivating) the table if it is not being used -->
                    <Button v-if="props.isInProgress"
                        class="ml-2"
                        icon="pi pi-pause-circle"
                        severity="warning"
                        :disabled="true"
                        @click="" />
                </div>
            </div>
        </div>

        <div class="p-fluid mt-1 pt-1 border-none border-top-1 border-gray-200">
            <Button v-if="props.isInProgress"
                class="fluid-icon-button"
                icon="pi pi-plus"
                :disabled="maxTablesReached"
                @click="() => setShowAddTableModal(true)" />
        </div>
    </div>

    <ConfirmModal
        :visible="showAddTableModal"
        header="Add new table"
        message=""
        confirmLabel="Add"
        :confirmDisabled="!canAdd"
        cancelLabel="Cancel"
        @confirm="addNewTable"
        @hide="() => setShowAddTableModal(false)">
        <TableInput
            v-model:name="newTableName"
            v-model:cost="newTableCost" />
    </ConfirmModal>
</template>

<style scoped>
.p-fluid .p-button.fluid-icon-button {
    width: 100%;
}
</style>
