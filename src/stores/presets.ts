import { useStorage } from "@vueuse/core"
import { defineStore } from "pinia"
import { v4 as uuidv4 } from "uuid"
import { computed } from "vue"

import { copy, type FlyerSettings } from "@/data/FlyerSettings"

export interface Preset {
    id: string
    name: string
    settings: FlyerSettings
}

export const usePresetsStore = defineStore("presets", () => {
    const presets = useStorage("presets", <Preset[]>[])

    const noPresets = computed(() => presets.value.length <= 0)

    const addPreset = (name: string, settings: FlyerSettings) => {
        presets.value = [...presets.value, {
            id: uuidv4(),
            name,
            settings: copy(settings),
        }]
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

        addPreset,
        deletePreset,
    }
})
