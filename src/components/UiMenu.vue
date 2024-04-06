<script setup lang="ts">
import DarkModeToggleButton from "./DarkModeToggleButton.vue"
import SidebarLayoutToggleButton from "./SidebarLayoutToggleButton.vue"

import { useScreenSizes } from "../composables/useScreenSizes"

const {
    isSmallScreen,
} = useScreenSizes()
</script>

<template>
    <div class="flex gap-1">
        <!-- TODO: allow customising UI appearance: light/dark mode,
        colour theme, sidebar position, etc -->
        <SidebarLayoutToggleButton v-if="!isSmallScreen" />

        <DarkModeToggleButton />
    </div>
</template>
