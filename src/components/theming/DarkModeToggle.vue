<script setup lang="ts">
import { useDark } from "@vueuse/core"
import { v4 as uuidv4 } from "uuid"

const isDark = useDark()

const id = "dark-mode-toggle-" + uuidv4()

// BUG: when page is reloaded while in dark mode, the page reverts to light mode
// and the toggle still says it's dark mode
</script>

<template>
    <div class="flex gap-2 align-items-center justify-content-between">
        <label :for="id">
            Dark mode
        </label>

        <InputSwitch
            :id="id"
            v-model="isDark" />
    </div>
</template>
