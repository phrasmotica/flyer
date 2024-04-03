<script setup lang="ts">
import { computed, ref } from "vue"
import type { MenuItem } from "primevue/menuitem"

import FixtureList from "./FixtureList.vue"
import PhaseInfoSection from "./PhaseInfoSection.vue"
import ResultsTable from "./ResultsTable.vue"
import TablesSummary from "./TablesSummary.vue"

import { useQueryParams } from "../composables/useQueryParams"

import type { Fixture } from "../data/Fixture"

enum Display {
    Fixtures,
    Tables,
    Standings,
    Info,
}

const props = defineProps<{
    overflow?: boolean
}>()

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
        // TODO: add event log section. A log of timestamped messages: player A
        // beat player B 2-0, Round 1 was finished, etc
    ]

    if (isHistoric.value) {
        defaultItems.splice(1, 1)
    }

    return defaultItems
})
</script>

<template>
    <div>
        <TabMenu class="mb-2" :model="items" />

        <div :class="props.overflow && 'overflow'">
            <FixtureList v-if="display === Display.Fixtures"
                @showFixtureModal="f => emit('selectFixture', f)" />

            <ResultsTable v-if="display === Display.Standings"
                isInProgress />

            <TablesSummary v-if="display === Display.Tables"
                @showFixtureModal="f => emit('selectFixture', f)" />

            <PhaseInfoSection v-if="display === Display.Info" />
        </div>
    </div>
</template>

<style scoped>
.overflow {
    height: 70vh;
    overflow-y: auto;
}
</style>
