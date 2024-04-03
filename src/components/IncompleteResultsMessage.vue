<script setup lang="ts">
const props = defineProps<{
    count: number
}>()
</script>

<template>
    <!-- MEDIUM: restore dark mode to this message -->
    <Message severity="warn" :closable="false">
        <em>{{ props.count }} player(s) have incomplete results!</em>
    </Message>
</template>
