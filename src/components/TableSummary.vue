<script setup lang="ts">
import { computed, onUnmounted, onMounted } from "vue"
import { useI18n } from "vue-i18n"

import TableBadge from "./TableBadge.vue"

import { useFixture } from "../composables/useFixture"
import { useFlyer } from "../composables/useFlyer"
import { usePhase } from "../composables/usePhase"

import type { Table } from "../data/Table"
import type { Fixture } from "../data/Fixture"

import { useFlyerStore } from "../stores/flyer"

const props = defineProps<{
    table: Table
}>()

const emit = defineEmits<{
    showFixtureModal: [fixture: Fixture]
}>()

const { d, n } = useI18n()

const flyerStore = useFlyerStore()

const {
    currentPhase,
} = useFlyer(flyerStore.flyer)

const {
    fixtures,
    getRound,
    isInProgress,
    getFixtureHeader,
} = usePhase(currentPhase.value)

const fixture = computed(() => fixtures.value.find(f => !f.finishTime && f.tableId === props.table.id))

const {
    elapsedMilliseconds,
    resumeClock,
    pauseClock,
} = useFixture("tableSummary", fixture.value, getRound(fixture.value?.id || ""), currentPhase.value)

const fixtureDescription = computed(() => fixture.value ? getFixtureHeader(fixture.value) : null)

const fixtureClock = computed(() => d(elapsedMilliseconds.value, "clock"))

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

            <div v-if="fixture" class="cursor-pointer" @click="() => emit('showFixtureModal', fixture!)">
                <Badge severity="secondary">
                    {{ fixtureDescription }} - {{ fixtureClock }}
                </Badge>
            </div>
        </div>

        <!-- LOW: allow pausing (deactivating) the table if it is not being used -->
        <Button v-if="isInProgress"
            class="ml-2"
            icon="pi pi-pause-circle"
            severity="warning"
            :disabled="true"
            @click="" />
    </div>
</template>
