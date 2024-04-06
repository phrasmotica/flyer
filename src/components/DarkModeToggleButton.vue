<script setup lang="ts">
import { useDark, useToggle } from "@vueuse/core"
import { computed } from "vue"

const isDark = useDark()
const toggleDark = useToggle(isDark)

const icon = computed(() => isDark.value ? "pi pi-sun" : "pi pi-moon")
</script>

<template>
    <Button
        :icon="icon"
        @click="toggleDark()" />
</template>
