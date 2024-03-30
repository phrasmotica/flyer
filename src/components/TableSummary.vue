<script setup lang="ts">
import { computed } from "vue"
import { useI18n } from "vue-i18n"

import TableBadge from "./TableBadge.vue"

import { useFlyer } from "../composables/useFlyer"
import { usePhase } from "../composables/usePhase"

import type { Table } from "../data/Table"

import { useFlyerStore } from "../stores/flyer"

const props = defineProps<{
    table: Table
}>()

const { n } = useI18n()

const flyerStore = useFlyerStore()

const {
    currentPhase,
} = useFlyer(flyerStore.flyer)

const {
    fixtures,
    isInProgress,
    getFixtureHeader,
} = usePhase(currentPhase.value)

const fixtureDescription = computed(() => {
    const fixture = fixtures.value.find(f => !f.finishTime && f.tableId === props.table.id)
    return fixture ? getFixtureHeader(fixture) : null
})
</script>

<template>
    <div class="flex">
        <div class="flex-grow-1">
            <TableBadge showBusy :table="props.table" />

            <div>
                <Badge severity="secondary">
                    {{ n(props.table.costPerHour, "currency") }} per hour
                </Badge>
            </div>

            <div v-if="fixtureDescription">
                <Badge severity="secondary">
                    {{ fixtureDescription }}
                </Badge>
            </div>

            <!-- MEDIUM: indicate which fixture is being played on the table,
            and allow opening the fixture modal -->
        </div>

        <!-- MEDIUM: allow pausing (deactivating) the table if it is not being used -->
        <Button v-if="isInProgress"
            class="ml-2"
            icon="pi pi-pause-circle"
            severity="warning"
            :disabled="true"
            @click="" />
    </div>
</template>
