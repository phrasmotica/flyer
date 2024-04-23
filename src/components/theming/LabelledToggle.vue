<script setup lang="ts">
import { v4 as uuidv4 } from "uuid"

const isToggled = defineModel<boolean>()

const props = defineProps<{
    label: string
}>()

const id = "labelled-toggle-" + uuidv4()
</script>

<template>
    <div class="flex gap-4 align-items-center justify-content-between">
        <label :for="id" class="text-sm">
            {{ props.label }}
        </label>

        <InputSwitch
            :id="id"
            v-model="isToggled" />
    </div>
</template>
