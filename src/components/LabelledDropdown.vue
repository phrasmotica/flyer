<script setup lang="ts">
import { v4 as uuidv4 } from "uuid"

const value = defineModel<string>()

const props = defineProps<{
    label: string
    options: string[]
    disabled?: boolean
}>()

const id = "labelled-dropdown-" + uuidv4()
</script>

<template>
    <div class="p-fluid mb-2">
        <label
            :for="id"
            class="font-bold"
            :class="[props.disabled && 'text-color-secondary']">
            {{ props.label }}
        </label>

        <Dropdown
            :inputId="id"
            v-model="value"
            :options="props.options"
            :disabled="props.disabled" />
    </div>
</template>
