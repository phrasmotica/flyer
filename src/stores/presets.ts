import { useStorage } from "@vueuse/core"
import { defineStore } from "pinia"
import { v4 as uuidv4 } from "uuid"
import { computed } from "vue"

import { useSettingsStore } from "./settings"

import type { FlyerSettings } from "@/data/FlyerSettings"

interface Preset {
    id: string
    name: string
    settings: FlyerSettings
}

export const usePresetsStore = defineStore("presets", () => {
    const presets = useStorage("presets", <Preset[]>[])

    const settingsStore = useSettingsStore()

    const noPresets = computed(() => presets.value.length <= 0)

    const add = (name: string, settings: FlyerSettings) => {
        presets.value = [...presets.value, {
            id: uuidv4(),
            name,
            settings,
        }]
    }

    const loadPreset = (id: string) => {
        const preset = presets.value.find(p => p.id === id)
        if (!preset) {
            console.log(`No preset ${id} exists!`)
            return
        }

        settingsStore.settings = preset.settings
    }

    const deletePreset = (id: string) => {
        const idx = presets.value.findIndex(p => p.id === id)
        if (idx >= 0) {
            const newPresets = [...presets.value]
            newPresets.splice(idx, 1)
            presets.value = newPresets
        }
    }

    return {
        presets,

        noPresets,

        add,
        loadPreset,
        deletePreset,
    }
})
