<script setup lang="ts">
import { computed } from "vue"

const props = defineProps<{
    value: number,
}>()

const summary = computed(() => `Races to ${props.value}`)
</script>

<template>
    <Badge
        :value="summary"
        severity="secondary"/>
</template>
