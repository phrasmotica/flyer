<script setup lang="ts">
import DarkModeToggleButton from "./DarkModeToggleButton.vue"
import SidebarLayoutToggle from "./SidebarLayoutToggle.vue"

import { useScreenSizes } from "@/composables/useScreenSizes"

const {
    isSmallScreen,
} = useScreenSizes()
</script>

<template>
    <SidebarLayoutToggle v-if="!isSmallScreen" />

    <div class="flex gap-1">
        <!-- TODO: allow customising UI appearance: light/dark mode,
        colour theme, sidebar position, etc -->

        <DarkModeToggleButton />
    </div>
</template>
