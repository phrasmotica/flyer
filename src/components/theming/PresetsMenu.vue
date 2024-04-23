<script setup lang="ts">
import { usePresetsStore } from "@/stores/presets"
import { useSettingsStore } from "@/stores/settings"

const presetsStore = usePresetsStore()
const settingsStore = useSettingsStore()

const saveNewPreset = () => {
    presetsStore.addPreset(
        "Preset " + (presetsStore.presets.length + 1),
        settingsStore.exportSettings())
}
</script>

<template>
    <div>
        <div class="p-fluid">
            <Button
                class="text-sm"
                :label="$t('presets.saveNewPreset')"
                severity="warning"
                @click="saveNewPreset" />
        </div>

        <div v-if="presetsStore.noPresets" class="mt-2 text-sm text-color-secondary">
            {{ $t('presets.noPresets') }}
        </div>

        <div v-else>
            <div v-for="p of presetsStore.presets"
                class="flex align-items-center justify-content-between mt-2">
                <span class="text-sm">
                    {{ p.name }}
                </span>

                <div class="flex gap-2 ml-2">
                    <Button
                        icon="pi pi-upload"
                        severity="warning"
                        @click="() => settingsStore.importSettings(p.settings)" />

                    <Button
                        icon="pi pi-trash"
                        severity="danger"
                        @click="() => presetsStore.deletePreset(p.id)" />
                </div>
            </div>
        </div>
    </div>
</template>
