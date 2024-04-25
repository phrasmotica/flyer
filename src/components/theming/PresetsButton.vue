<script setup lang="ts">
import { ref } from "vue"

import PresetsMenu from "./PresetsMenu.vue"

const op = ref()

const toggleOp = (event: MouseEvent) => {
    op.value.toggle(event)
}
</script>

<template>
    <Button
        icon="pi pi-save"
        severity="warning"
        @click="toggleOp" />

    <OverlayPanel ref="op">
        <PresetsMenu />
    </OverlayPanel>
</template>
