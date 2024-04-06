<script setup lang="ts">
import { computed } from "vue"

import { useFlyer } from "@/composables/useFlyer"
import { usePhase } from "@/composables/usePhase"

import type { Table } from "@/data/Table"

import { useFlyerStore } from "@/stores/flyer"

const props = defineProps<{
    table: Table
    showBusy?: boolean
}>()

const flyerStore = useFlyerStore()

const {
    currentPhase,
} = useFlyer(flyerStore.flyer)

const {
    freeTables,
} = usePhase(currentPhase.value)

const isBusy = computed(() => !freeTables.value.some(t => t.id === props.table.id))

const label = computed(() => {
    if (!props.showBusy) {
        return props.table.name
    }

    return props.table.name + " - " + (isBusy.value ? "BUSY" : "AVAILABLE")
})

const severity = computed(() => isBusy.value ? "danger" : "primary")
</script>

<template>
    <Badge :value="label" :severity="severity" />
</template>
