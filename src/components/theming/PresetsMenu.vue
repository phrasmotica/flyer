<script setup lang="ts">
import { usePresetsStore } from "@/stores/presets"
import { useSettingsStore } from "@/stores/settings"

const presetsStore = usePresetsStore()
const settingsStore = useSettingsStore()

const saveNewPreset = () => {
    presetsStore.add("new preset", {
        ...settingsStore.settings
    })
}
</script>

<template>
    <div>
        <Button
            class="text-sm"
            label="Save as new preset"
            severity="warning"
            @click="saveNewPreset" />
    </div>
</template>
