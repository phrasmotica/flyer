<script setup lang="ts">
import { useToggle } from "@vueuse/core"
import { ref, watch } from "vue"

import type { Preset } from "@/stores/presets"

const props = defineProps<{
    preset: Preset
}>()

const emit = defineEmits<{
    load: []
    setName: [name: string]
    delete: []
}>()

const [isEditMode, toggleIsEditMode] = useToggle()

const name = ref(props.preset.name)

watch(props, () => {
    name.value = props.preset.name
})

const setName = () => {
    if (!name.value) {
        return
    }

    emit('setName', name.value)

    toggleIsEditMode(false)
}
</script>

<template>
    <div class="flex align-items-center justify-content-between">
        <div class="w-7rem flex-grow-1">
            <div v-if="!isEditMode"
                class="name-container text-sm">
                {{ props.preset.name }}
            </div>

            <InputText v-else
                class="text-sm"
                style="width: 100%"
                v-model="name" />
        </div>

        <div class="flex gap-2 ml-2">
            <Button v-if="!isEditMode"
                icon="pi pi-file-edit"
                severity="info"
                @click="() => toggleIsEditMode()" />

            <Button v-else
                icon="pi pi-check"
                severity="success"
                :disabled="!name"
                @click="setName" />

            <Button v-if="!isEditMode"
                icon="pi pi-upload"
                severity="warning"
                @click="() => emit('load')" />

            <Button v-if="!isEditMode"
                icon="pi pi-trash"
                severity="danger"
                @click="() => emit('delete')" />
        </div>
    </div>
</template>

<style>
.name-container {
    overflow: hidden;
    white-space: nowrap;
    text-overflow: ellipsis;
}
</style>
