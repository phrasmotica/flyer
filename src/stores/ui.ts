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

    const setPinnedSection = (section: number) => {
        settings.value.pinnedSection = section
    }

    return {
        pinnedSection,

        setPinnedSection,
    }
})
