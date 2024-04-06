<script setup lang="ts">
import { ref } from "vue"

import DarkModeToggleButton from "./DarkModeToggleButton.vue"
import SidebarLayoutToggleButton from "./SidebarLayoutToggleButton.vue"

import { useScreenSizes } from "../composables/useScreenSizes"

const {
    isSmallScreen,
} = useScreenSizes()

const op = ref()

const toggleOp = (event: MouseEvent) => {
    op.value.toggle(event)
}
</script>

<template>
    <!-- TODO: allow customising UI appearance in a modal/popup.
    Light/dark mode, colour theme, sidebar position, etc. This should appear for
    all screen sizes -->

    <Button
        icon="pi pi-palette"
        @click="toggleOp" />

    <OverlayPanel ref="op">
        <div class="flex gap-1">
            <SidebarLayoutToggleButton v-if="!isSmallScreen" />

            <DarkModeToggleButton />
        </div>
    </OverlayPanel>
</template>
