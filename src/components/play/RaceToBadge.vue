<script setup lang="ts">
import { computed } from "vue"

const props = defineProps<{
    value: number
    singular?: boolean
}>()

const summary = computed(() => {
    if (props.singular) {
        return `Race to ${props.value}`
    }

    return `Races to ${props.value}`
})
</script>

<template>
    <Badge
        :value="summary"
        severity="secondary"/>
</template>
