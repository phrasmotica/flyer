<script setup lang="ts">
import { useUiStore } from "@/stores/ui"

const uiStore = useUiStore()
</script>

<template>
    <Button
        icon="pi pi-arrow-right-arrow-left"
        severity="help"
        @click="uiStore.toggleSidebarPosition" />
</template>
