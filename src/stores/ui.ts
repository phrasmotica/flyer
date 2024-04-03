import { computed } from "vue"
import { defineStore } from "pinia"
import { useStorage } from "@vueuse/core"

import { FlyerFormSection, PlayViewSection, SidebarPosition, type UiSettings } from "../data/UiSettings"

const defaultSettings: UiSettings = {
    sidebarPosition: SidebarPosition.Right,
    flyerFormSection: FlyerFormSection.Players,
    currentSection: PlayViewSection.Fixtures,
    pinnedSection: null,
}

export const useUiStore = defineStore("ui", () => {
    const settings = useStorage("ui", defaultSettings)

    const sidebarPosition = computed(() => settings.value.sidebarPosition)
    const flyerFormSection = computed(() => settings.value.flyerFormSection)
    const currentSection = computed(() => settings.value.currentSection)
    const pinnedSection = computed(() => settings.value.pinnedSection)

    const isSidebarRight = computed(() => sidebarPosition.value === SidebarPosition.Right)
    const isSidebarLeft = computed(() => sidebarPosition.value === SidebarPosition.Left)
    const isFixtures = computed(() => currentSection.value === PlayViewSection.Fixtures)

    const togglePinnedSection = (section: PlayViewSection) => {
        if (pinnedSection.value !== section) {
            settings.value.pinnedSection = section
        }
        else {
            settings.value.pinnedSection = null
        }
    }

    return {
        settings,

        flyerFormSection,
        currentSection,
        pinnedSection,

        isSidebarRight,
        isSidebarLeft,
        isFixtures,

        togglePinnedSection,
    }
})
