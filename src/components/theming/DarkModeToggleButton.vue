<script setup lang="ts">
import { useDark, useToggle } from "@vueuse/core"
import { computed } from "vue"

const isDark = useDark()
const toggleDark = useToggle(isDark)

const icon = computed(() => isDark.value ? "pi pi-sun" : "pi pi-moon")

// BUG: when page is reloaded while in dark mode, the page reverts to light mode
// and this button still mistakenly shows the sun icon
</script>

<template>
    <Button
        :icon="icon"
        @click="toggleDark()" />
</template>
