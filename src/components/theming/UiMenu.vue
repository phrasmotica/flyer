<script setup lang="ts">
import DarkModeToggle from "./DarkModeToggle.vue"
import SidebarLayoutToggle from "./SidebarLayoutToggle.vue"

import { useScreenSizes } from "@/composables/useScreenSizes"

const {
    isSmallScreen,
} = useScreenSizes()
</script>

<template>
    <div>
        <DarkModeToggle />

        <SidebarLayoutToggle v-if="!isSmallScreen" class="mt-2" />

        <!-- MEDIUM: allow customising colour theme (green/blue/etc) -->
    </div>
</template>
