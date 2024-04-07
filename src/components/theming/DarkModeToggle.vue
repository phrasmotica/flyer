<script setup lang="ts">
import { useDark } from "@vueuse/core"
import { v4 as uuidv4 } from "uuid"

const isDark = useDark()

const id = "dark-mode-toggle-" + uuidv4()
</script>

<template>
    <div class="flex gap-4 align-items-center justify-content-between">
        <label :for="id" class="text-sm">
            Dark mode
        </label>

        <InputSwitch
            :id="id"
            v-model="isDark" />
    </div>
</template>
