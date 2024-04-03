<script setup lang="ts">
import { computed, ref } from "vue"
import type { MenuItem } from "primevue/menuitem"

import FixtureList from "./FixtureList.vue"
import PhaseEventLogSection from "./PhaseEventLogSection.vue"
import PhaseInfoSection from "./PhaseInfoSection.vue"
import ResultsTable from "./ResultsTable.vue"
import TablesSummary from "./TablesSummary.vue"

import { useQueryParams } from "../composables/useQueryParams"

import type { Fixture } from "../data/Fixture"

import { useUiStore } from "../stores/ui"

enum Display {
    Fixtures,
    Tables,
    Standings,
    Info,
    EventLog,
}

const props = defineProps<{
    overflow?: boolean
    pinButton?: boolean
}>()

const uiStore = useUiStore()

const emit = defineEmits<{
    selectFixture: [fixture: Fixture]
}>()

const {
    isHistoric,
} = useQueryParams()

const display = ref(Display.Fixtures)

const items = computed(() => {
    const defaultItems = <MenuItem[]>[
        {
            icon: 'pi pi-calendar',
            command: _ => display.value = Display.Fixtures,
        },
        {
            icon: 'pi pi-chart-bar',
            command: _ => display.value = Display.Standings,
        },
        {
            icon: 'pi pi-building',
            command: _ => display.value = Display.Tables,
        },
        {
            icon: 'pi pi-info-circle',
            command: _ => display.value = Display.Info,
        },
        {
            icon: 'pi pi-receipt',
            command: _ => display.value = Display.EventLog,
        },
    ]

    if (isHistoric.value) {
        defaultItems.splice(1, 1)
    }

    return defaultItems
})

const pinButtonLabel = computed(() => {
    if (uiStore.pinnedSection === display.value) {
        return "Unpin this section"
    }

    return "Pin this section"
})

const canPin = computed(() => display.value === Display.Fixtures)

const pinSection = () => {
    uiStore.setPinnedSection(display.value)
}
</script>

<template>
    <div>
        <TabMenu class="mb-2" :model="items" />

        <div v-if="props.pinButton" class="p-fluid mb-1">
            <Button
                :label="pinButtonLabel"
                :disabled="canPin"
                severity="info"
                @click="pinSection" />
        </div>

        <div :class="props.overflow && 'overflow'">
            <FixtureList v-if="display === Display.Fixtures"
                @showFixtureModal="f => emit('selectFixture', f)" />

            <ResultsTable v-if="display === Display.Standings"
                isInProgress />

            <TablesSummary v-if="display === Display.Tables"
                @showFixtureModal="f => emit('selectFixture', f)" />

            <PhaseInfoSection v-if="display === Display.Info" />

            <PhaseEventLogSection v-if="display === Display.EventLog" />
        </div>
    </div>
</template>

<style scoped>
.overflow {
    height: 70vh;
    overflow-y: auto;
}
</style>
