<script setup lang="ts">
import { v4 as uuidv4 } from "uuid"

const value = defineModel<boolean>()

const props = defineProps<{
    label: string
    disabled?: boolean
}>()

const id = "labelled-checkbox-" + uuidv4()
</script>

<template>
    <div class="p-fluid flex justify-content-between">
        <label :for="id" :class="[props.disabled && 'text-color-secondary']">
            {{ label }}
        </label>

        <Checkbox
            :inputId="id"
            v-model="value"
            :binary="true"
            :disabled="props.disabled" />
    </div>
</template>
