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
    pinnedOnly?: boolean
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

const canPin = computed(() => display.value !== Display.Fixtures)

const pinSection = () => {
    uiStore.setPinnedSection(display.value)
}

const showSection = (section: Display) => {
    if (props.pinnedOnly) {
        return uiStore.pinnedSection === section
    }

    return display.value === section
}
</script>

<template>
    <div>
        <TabMenu v-if="!props.pinnedOnly" class="mb-2" :model="items" />

        <div v-if="props.pinButton && canPin" class="p-fluid pb-2 border-bottom-1 mb-1">
            <Button
                :label="pinButtonLabel"
                severity="info"
                @click="pinSection" />
        </div>

        <div :class="props.overflow && 'overflow'">
            <FixtureList v-if="showSection(Display.Fixtures)"
                @showFixtureModal="f => emit('selectFixture', f)" />

            <ResultsTable v-if="showSection(Display.Standings)"
                isInProgress />

            <TablesSummary v-if="showSection(Display.Tables)"
                @showFixtureModal="f => emit('selectFixture', f)" />

            <PhaseInfoSection v-if="showSection(Display.Info)" />

            <PhaseEventLogSection v-if="showSection(Display.EventLog)" />
        </div>
    </div>
</template>

<style scoped>
.overflow {
    height: 70vh;
    overflow-y: auto;
}
</style>
