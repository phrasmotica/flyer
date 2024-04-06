<script setup lang="ts">
import { ref } from "vue"

import UiMenu from "./UiMenu.vue"

const op = ref()

const toggleOp = (event: MouseEvent) => {
    op.value.toggle(event)
}
</script>

<template>
    <Button
        icon="pi pi-palette"
        @click="toggleOp" />

    <OverlayPanel ref="op">
        <UiMenu />
    </OverlayPanel>
</template>
