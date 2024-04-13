<script setup lang="ts">
import { computed } from "vue"
import { useI18n } from "vue-i18n"

import LabelledDropdown from "../setup/LabelledDropdown.vue"

import { useFixture } from "@/composables/useFixture"
import { useFlyer } from "@/composables/useFlyer"
import { usePhase } from "@/composables/usePhase"
import { usePhaseEvents } from "@/composables/usePhaseEvents"

import type { Fixture } from "@/data/Fixture"

import { useFlyerStore } from "@/stores/flyer"

const { t } = useI18n()

const props = defineProps<{
    fixture: Fixture
}>()

const flyerStore = useFlyerStore()

const {
    currentPhase,
} = useFlyer(flyerStore.flyer)

const phaseEvents = usePhaseEvents(currentPhase.value)

const {
    freeTables,
    getRound,
} = usePhase(currentPhase.value)

const {
    fixture,
    tableId,
} = useFixture("modal", props.fixture, getRound(props.fixture.id), currentPhase.value)

const freeTablesOptions = computed(() => freeTables.value.map(t => ({
    name: t.name,
    value: t.id,
})))

const canAssignTable = computed(() => !!tableId.value)

const assignTable = () => {
    if (!currentPhase.value || !fixture.value || !tableId.value) {
        return
    }

    flyerStore.assignTable(currentPhase.value, fixture.value.id, tableId.value)

    const message = phaseEvents.fixtureAssignedTable(fixture.value, tableId.value)
    flyerStore.addPhaseEvent(currentPhase.value, message)
}
</script>

<template>
    <div class="p-fluid">
        <p class="m-0 text-center">
            {{ t('fixture.pleaseAssignTable') }}
        </p>

        <LabelledDropdown
            noLocalise
            :label="t('table.table')"
            :options="freeTablesOptions"
            v-model="tableId" />

        <Button
            type="button"
            :label="t('common.assign')"
            :disabled="!canAssignTable"
            @click="assignTable" />
    </div>
</template>
