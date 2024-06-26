<script setup lang="ts">
import { useToast } from "primevue/usetoast"
import { useI18n } from "vue-i18n"

import PresetInfo from "./PresetInfo.vue"

import { usePresetsStore, type Preset } from "@/stores/presets"
import { useSettingsStore } from "@/stores/settings"

const { t } = useI18n()

const presetsStore = usePresetsStore()
const settingsStore = useSettingsStore()

const toast = useToast()

const loadPreset = (p: Preset) => {
    settingsStore.importSettings(p.settings)

    toast.add({
        severity: 'info',
        summary: t('presets.loadedPreset'),
        detail: t('presets.loadedPresetName', {
            name: p.name,
        }),
        life: 3000,
    })
}

const saveNewPreset = () => {
    presetsStore.addPreset(
        "Preset " + (presetsStore.presets.length + 1),
        settingsStore.exportSettings())
}
</script>

<template>
    <div style="width: 240px;">
        <div class="p-fluid">
            <p class="m-0 mb-1 text-sm">
                {{ t('presets.presetsExplanation') }}
            </p>

            <Button
                class="text-sm mb-1"
                :label="$t('presets.saveNewPreset')"
                severity="warning"
                @click="saveNewPreset" />
        </div>

        <div class="overflow-y-auto mt-1 border-top-1" style="max-height: 200px;">
            <div v-if="presetsStore.noPresets" class="mt-2 text-sm text-color-secondary">
                {{ $t('presets.noPresets') }}
            </div>

            <div v-else>
                <div v-for="p of presetsStore.presets"
                    class="mt-2">
                    <PresetInfo
                        :preset="p"
                        @load="() => loadPreset(p)"
                        @setName="name => presetsStore.setName(p.id, name)"
                        @delete="() => presetsStore.deletePreset(p.id)" />
                </div>
            </div>
        </div>
    </div>
</template>
