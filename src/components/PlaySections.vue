<script setup lang="ts">
import { computed, ref } from "vue"
import type { MenuItem } from "primevue/menuitem"

import FixtureList from "./FixtureList.vue"
import InfoList from "./InfoList.vue"
import PrizePotSummary from "./PrizePotSummary.vue"
import ResultsTable from "./ResultsTable.vue"
import TablesSummary from "./TablesSummary.vue"

import { useFlyer } from "../composables/useFlyer"
import { usePhase } from "../composables/usePhase"
import { useQueryParams } from "../composables/useQueryParams"

import type { Fixture } from "../data/Fixture"

import { useFlyerStore } from "../stores/flyer"

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

const flyerStore = useFlyerStore()

const {
    currentPhase,
} = useFlyer(flyerStore.flyer)

const {
    settings,
    players,
    rounds,
} = usePhase(currentPhase.value)

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
    ]

    if (isHistoric.value) {
        defaultItems.splice(1, 1)
    }

    return defaultItems
})

const raceTos = computed(() => rounds.value.map(r => ({
    name: r.name,
    raceTo: r.raceTo,
})))
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

            <div v-if="display === Display.Info">
                <InfoList :settings="settings" :raceTos="raceTos" />

                <div
                    v-if="settings.entryFeeRequired"
                    class="pt-2 border-top-1 border-gray-200 mb-2">
                    <PrizePotSummary :settings="settings" :playerCount="players.length" />
                </div>
            </div>
        </div>
    </div>
</template>

<style scoped>
.overflow {
    height: 70vh;
    overflow-y: auto;
}
</style>
