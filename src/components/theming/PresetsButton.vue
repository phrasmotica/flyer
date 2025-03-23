<script setup lang="ts">
import { ref } from "vue"

import PresetsMenu from "./PresetsMenu.vue"

const props = defineProps<{
    label?: string,
}>()

const op = ref()

const toggleOp = (event: MouseEvent) => {
    op.value.toggle(event)
}
</script>

<template>
    <Button
        class="text-left"
        :label="props.label"
        icon="pi pi-save"
        iconPos="right"
        severity="warning"
        @click="toggleOp" />

    <OverlayPanel ref="op">
        <PresetsMenu />
    </OverlayPanel>
</template>
