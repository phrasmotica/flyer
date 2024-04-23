<script setup lang="ts">
import PresetInfo from "./PresetInfo.vue"

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
                class="mt-2">
                <PresetInfo
                    :preset="p"
                    @load="() => settingsStore.importSettings(p.settings)"
                    @setName="name => presetsStore.setName(p.id, name)"
                    @delete="() => presetsStore.deletePreset(p.id)" />
            </div>
        </div>
    </div>
</template>
