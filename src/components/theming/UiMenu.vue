<script setup lang="ts">
import DarkModeToggle from "./DarkModeToggle.vue"
import LabelledToggle from "./LabelledToggle.vue"
import SidebarLayoutToggle from "./SidebarLayoutToggle.vue"

import { useEnv } from "@/composables/useEnv"
import { useScreenSizes } from "@/composables/useScreenSizes"

import { useUiStore } from "@/stores/ui"

const uiStore = useUiStore()

const {
    isDebug,
} = useEnv()

const {
    isSmallScreen,
} = useScreenSizes()
</script>

<template>
    <div>
        <LabelledToggle v-if="isDebug"
            class="mb-2"
            v-model="uiStore.settings.debug"
            label="Debug mode" />

        <DarkModeToggle />

        <SidebarLayoutToggle v-if="!isSmallScreen" class="mt-2" />

        <!-- MEDIUM: allow customising colour theme (green/blue/etc) -->
    </div>
</template>
