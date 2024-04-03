import { computed } from "vue"
import { defineStore } from "pinia"
import { useStorage } from "@vueuse/core"

import type { UiSettings } from "../data/UiSettings"

const defaultSettings: UiSettings = {
    pinnedSection: null,
}

export const useUiStore = defineStore("ui", () => {
    const settings = useStorage("ui", defaultSettings)

    const pinnedSection = computed(() => settings.value.pinnedSection)

    const togglePinnedSection = (section: number) => {
        if (pinnedSection.value !== section) {
            settings.value.pinnedSection = section
        }
        else {
            settings.value.pinnedSection = null
        }
    }

    return {
        pinnedSection,

        togglePinnedSection,
    }
})
