<script setup lang="ts">
import type { Preset } from "@/stores/presets"

const props = defineProps<{
    preset: Preset
}>()

const emit = defineEmits<{
    load: []
    delete: []
}>()
</script>

<template>
    <div class="flex align-items-center justify-content-between mt-2">
        <span class="text-sm">
            {{ props.preset.name }}
        </span>

        <div class="flex gap-2 ml-2">
            <Button
                icon="pi pi-upload"
                severity="warning"
                @click="() => emit('load')" />

            <Button
                icon="pi pi-trash"
                severity="danger"
                @click="() => emit('delete')" />
        </div>
    </div>
</template>
