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
import { PlayViewSection } from "../data/UiSettings"

import { useUiStore } from "../stores/ui"

const props = defineProps<{
    overflow?: boolean
    pinnable?: boolean
    pinnedOnly?: boolean
}>()

const uiStore = useUiStore()

const emit = defineEmits<{
    selectFixture: [fixture: Fixture]
}>()

const {
    isHistoric,
} = useQueryParams()

const items = computed(() => <MenuItem[]>[
    // MEDIUM: reinstate logic for hiding certain sections, once we've removed
    // the dependency on the underlying enum values for tracking the active index
    {
        icon: 'pi pi-calendar',
        command: _ => uiStore.settings.currentSection = PlayViewSection.Fixtures,
    },
    {
        icon: 'pi pi-chart-bar',
        command: _ => uiStore.settings.currentSection = PlayViewSection.Standings,
    },
    {
        icon: 'pi pi-building',
        command: _ => uiStore.settings.currentSection = PlayViewSection.Tables,
    },
    {
        icon: 'pi pi-info-circle',
        command: _ => uiStore.settings.currentSection = PlayViewSection.Info,
    },
    {
        icon: 'pi pi-receipt',
        command: _ => uiStore.settings.currentSection = PlayViewSection.EventLog,
    },
])

const pinButtonLabel = computed(() => {
    if (uiStore.pinnedSection === uiStore.currentSection) {
        return "Unpin this section"
    }

    return "Pin this section"
})

const canPin = computed(() => uiStore.currentSection !== PlayViewSection.Fixtures)

const showCurrentSection = computed(() => {
    if (uiStore.pinnedSection === uiStore.currentSection) {
        return isHistoric.value || props.pinnedOnly || !props.pinnable
    }

    return true
})

const pinSection = () => {
    uiStore.togglePinnedSection(uiStore.currentSection)
}

const showSection = (section: PlayViewSection) => {
    if (props.pinnedOnly) {
        return uiStore.pinnedSection === section
    }

    return uiStore.currentSection === section
}
</script>

<template>
    <div>
        <TabMenu v-if="!props.pinnedOnly"
            class="mb-2"
            :model="items"
            :activeIndex="uiStore.currentSection" />

        <div v-if="!isHistoric && props.pinnable">
            <div v-if="canPin" class="p-fluid pb-2 border-bottom-1 mb-1">
                <Button
                    :label="pinButtonLabel"
                    severity="info"
                    @click="pinSection" />
            </div>

            <p v-if="!props.pinnedOnly && uiStore.pinnedSection === uiStore.currentSection"
                class="m-0 text-center text-sm font-italic text-color-secondary">
                This section is pinned
            </p>
        </div>

        <div v-if="showCurrentSection" :class="props.overflow && 'overflow'">
            <FixtureList v-if="showSection(PlayViewSection.Fixtures)"
                @showFixtureModal="f => emit('selectFixture', f)" />

            <ResultsTable v-if="showSection(PlayViewSection.Standings)"
                isInProgress
                :isPinned="uiStore.pinnedSection === PlayViewSection.Standings" />

            <TablesSummary v-if="showSection(PlayViewSection.Tables)"
                @showFixtureModal="f => emit('selectFixture', f)" />

            <PhaseInfoSection v-if="showSection(PlayViewSection.Info)" />

            <PhaseEventLogSection v-if="showSection(PlayViewSection.EventLog)" />
        </div>
    </div>
</template>

<style scoped>
.overflow {
    height: 70vh;
    overflow-y: auto;
}
</style>
