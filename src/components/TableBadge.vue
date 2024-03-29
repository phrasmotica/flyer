<script setup lang="ts">
import { usePhase } from "../composables/usePhase"
import { useFlyer } from "../composables/useFlyer"

import { useFlyerStore } from "../stores/flyer"

const props = defineProps<{
    tableId: string
}>()

const flyerStore = useFlyerStore()

const {
    currentPhase,
} = useFlyer(flyerStore.flyer)

const {
    getTableName,
} = usePhase(currentPhase.value)
</script>

<template>
    <Badge :value="getTableName(props.tableId)" />
</template>
