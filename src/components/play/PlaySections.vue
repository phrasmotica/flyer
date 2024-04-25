<script setup lang="ts">
import type { MenuItem } from "primevue/menuitem"
import { computed } from "vue"
import { useI18n } from "vue-i18n"

import ResultsMessages from "../results/ResultsMessages.vue"
import ResultsTable from "../results/ResultsTable.vue"
import FixtureList from "./FixtureList.vue"
import KnockoutBracket from "./KnockoutBracket.vue"
import PhaseEventLogSection from "./PhaseEventLogSection.vue"
import PhaseInfoSection from "./PhaseInfoSection.vue"
import TablesSummary from "./TablesSummary.vue"

import { useFlyer } from "@/composables/useFlyer"
import { useQueryParams } from "@/composables/useQueryParams"

import type { Fixture } from "@/data/Fixture"
import { PlayViewSection } from "@/data/UiSettings"

import { usePhaseSpecification } from "@/composables/useSpecification"
import { useFlyerStore } from "@/stores/flyer"
import { useUiStore } from "@/stores/ui"

const { t } = useI18n()

const props = defineProps<{
    sections?: PlayViewSection[]
    overflow?: boolean
    pinnable?: boolean
    pinnedOnly?: boolean
}>()

const flyerStore = useFlyerStore()
const uiStore = useUiStore()

const emit = defineEmits<{
    selectFixture: [fixture: Fixture]
}>()

const {
    currentPhase,
} = useFlyer(flyerStore.flyer)

const {
    isKnockout,
} = usePhaseSpecification(currentPhase.value)

const {
    isHistoric,
} = useQueryParams()

const defaultSections = [
    {
        icon: 'pi pi-calendar',
        value: PlayViewSection.Fixtures,
    },
    {
        icon: 'pi pi-chart-bar',
        value: PlayViewSection.Standings,
    },
    {
        icon: 'pi pi-building',
        value: PlayViewSection.Tables,
    },
    {
        icon: 'pi pi-info-circle',
        value: PlayViewSection.Info,
    },
    {
        icon: 'pi pi-receipt',
        value: PlayViewSection.EventLog,
    },
]

const relevantSections = computed(() => defaultSections.filter(x => {
    return !props.sections || props.sections.includes(x.value)
}))

const items = computed(() => {
    return relevantSections.value.map<MenuItem>(f => ({
        icon: f.icon,
        command: _ => uiStore.settings.currentSection = f.value,
    }))
})

const activeIndex = computed(() => {
    return relevantSections.value.findIndex(s => s.value === uiStore.currentSection)
})

const pinButtonLabel = computed(() => {
    if (uiStore.pinnedSection === uiStore.currentSection) {
        return t('play.unpinThisSection')
    }

    return t('play.pinThisSection')
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
            :activeIndex="activeIndex" />

        <div v-if="!isHistoric && props.pinnable">
            <div v-if="canPin" class="p-fluid pb-2 border-bottom-1 mb-1">
                <Button
                    :label="pinButtonLabel"
                    severity="info"
                    @click="pinSection" />
            </div>

            <Message v-if="!props.pinnedOnly && uiStore.pinnedSection === uiStore.currentSection"
                severity="info" :closable="false"
                class="m-0 mt-2">
                {{ t('play.thisSectionIsPinned') }}
            </Message>
        </div>

        <div v-if="showCurrentSection" :class="props.overflow && 'overflow'">
            <FixtureList v-if="showSection(PlayViewSection.Fixtures)"
                @showFixtureModal="f => emit('selectFixture', f)" />

            <div v-if="showSection(PlayViewSection.Standings)">
                <div v-if="isKnockout">
                    <!-- HIGH: put this in a modal, activated by a button above
                    the fixture list -->
                    <KnockoutBracket />
                </div>
                <div v-else>
                    <ResultsTable
                        isInProgress
                        :isPinned="uiStore.pinnedSection === PlayViewSection.Standings" />

                    <ResultsMessages v-if="uiStore.pinnedSection !== PlayViewSection.Standings"
                        isInProgress />
                </div>
            </div>

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
