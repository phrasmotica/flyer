<script setup lang="ts">
import { computed, onUnmounted, onMounted } from "vue"
import { useI18n } from "vue-i18n"

import TableBadge from "./TableBadge.vue"

import { useFixture } from "../composables/useFixture"
import { useFlyer } from "../composables/useFlyer"
import { usePhase } from "../composables/usePhase"

import type { Table } from "../data/Table"

import { useFlyerStore } from "../stores/flyer"

const props = defineProps<{
    table: Table
}>()

const { d, n } = useI18n()

const flyerStore = useFlyerStore()

const {
    currentPhase,
} = useFlyer(flyerStore.flyer)

const {
    settings,
    fixtures,
    getRound,
    isInProgress,
    getFixtureHeader,
} = usePhase(currentPhase.value)

const fixture = computed(() => fixtures.value.find(f => !f.finishTime && f.tableId === props.table.id))

const {
    elapsedSeconds,
    resumeClock,
    pauseClock,
} = useFixture("tableSummary", fixture.value, getRound(fixture.value?.id || ""), settings.value)

const fixtureDescription = computed(() => fixture.value ? getFixtureHeader(fixture.value) : null)

const fixtureClock = computed(() => d(elapsedSeconds.value * 1000, "clock"))

onMounted(() => {
    if (fixture?.value?.startTime && !fixture.value.finishTime) {
        resumeClock()
    }
})

onUnmounted(() => {
    pauseClock()
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

            <div v-if="fixture">
                <Badge severity="secondary">
                    {{ fixtureDescription }} - {{ fixtureClock }}
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
