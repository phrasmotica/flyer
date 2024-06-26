<script setup lang="ts">
import { computed, ref } from "vue"
import { useI18n } from "vue-i18n"
import { useToggle } from "@vueuse/core"

import AddTableModal from "../modals/AddTableModal.vue"
import TableSummary from "./TableSummary.vue"

import { useFlyer } from "@/composables/useFlyer"
import { usePhase } from "@/composables/usePhase"
import { usePhaseTiming } from "@/composables/usePhaseTiming"
import { useTables } from "@/composables/useTables"

import type { Fixture } from "@/data/Fixture"

import { useFlyerStore } from "@/stores/flyer"

const { t } = useI18n()

const emit = defineEmits<{
    showFixtureModal: [fixture: Fixture]
}>()

const flyerStore = useFlyerStore()

const newTableName = ref(t('play.tableX'))
const newTableCost = ref(9)

const [showAddTableModal, setShowAddTableModal] = useToggle(false)

const {
    currentPhase,
} = useFlyer(flyerStore.flyer)

const {
    maxTableCount,
} = usePhase(currentPhase.value)

const {
    isInProgress,
} = usePhaseTiming(currentPhase.value)

const {
    tables,
} = useTables(currentPhase.value)

const maxTablesReached = computed(() => tables.value.length >= maxTableCount.value)

const addNewTable = () => {
    flyerStore.addTable(newTableName.value, newTableCost.value)

    setShowAddTableModal(false)
}
</script>

<template>
    <div v-if="currentPhase">
        <div class="p-fluid">
            <div v-for="t, i in currentPhase.tables">
                <div :class="i > 0 && 'mt-1 pt-1 border-none border-top-1 border-dashed border-gray-200'">
                    <TableSummary :table="t" @showFixtureModal="f => emit('showFixtureModal', f)" />
                </div>
            </div>
        </div>

        <div class="p-fluid mt-1 pt-1 border-none border-top-1 border-gray-200">
            <Button v-if="isInProgress"
                class="fluid-icon-button"
                icon="pi pi-plus"
                :disabled="maxTablesReached"
                @click="() => setShowAddTableModal(true)" />
        </div>
    </div>

    <AddTableModal
        v-model:visible="showAddTableModal"
        v-model:name="newTableName"
        v-model:cost="newTableCost"
        @confirm="addNewTable"
        @hide="() => setShowAddTableModal(false)" />
</template>

<style scoped>
.p-fluid .p-button.fluid-icon-button {
    width: 100%;
}
</style>
