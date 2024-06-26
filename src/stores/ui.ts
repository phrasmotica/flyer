import { useStorage } from "@vueuse/core"
import { defineStore } from "pinia"
import { computed } from "vue"

import { FlyerFormSection, PlayViewSection, SidebarPosition, type UiSettings } from "@/data/UiSettings"

const defaultSettings: UiSettings = {
    baseColourTheme: "aura-light-green",
    colourTheme: "flyer-light",
    sidebarPosition: SidebarPosition.Right,
    flyerFormSection: FlyerFormSection.Players,
    currentSection: PlayViewSection.Fixtures,
    pinnedSection: null,
    debug: false,
}

export const sidebarPositionOptions = [
    {
        name: "Left",
        value: SidebarPosition.Left,
    },
    {
        name: "Right",
        value: SidebarPosition.Right,
    },
]

export const useUiStore = defineStore("ui", () => {
    const settings = useStorage("ui", defaultSettings)

    const baseColourTheme = computed(() => settings.value.baseColourTheme)
    const colourTheme = computed(() => settings.value.colourTheme)
    const sidebarPosition = computed(() => settings.value.sidebarPosition)
    const flyerFormSection = computed(() => settings.value.flyerFormSection)
    const currentSection = computed(() => settings.value.currentSection)
    const pinnedSection = computed(() => settings.value.pinnedSection)
    const isDebugMode = computed(() => settings.value.debug)

    const isSidebarRight = computed(() => sidebarPosition.value === SidebarPosition.Right)
    const isSidebarLeft = computed(() => sidebarPosition.value === SidebarPosition.Left)
    const isFixtures = computed(() => currentSection.value === PlayViewSection.Fixtures)

    const toggleSidebarPosition = () => {
        // MEDIUM: do this more generally
        if (sidebarPosition.value === SidebarPosition.Right) {
            settings.value.sidebarPosition = SidebarPosition.Left
        }
        else {
            settings.value.sidebarPosition = SidebarPosition.Right
        }
    }

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

        baseColourTheme,
        colourTheme,
        flyerFormSection,
        currentSection,
        pinnedSection,
        isDebugMode,

        isSidebarRight,
        isSidebarLeft,
        isFixtures,

        toggleSidebarPosition,
        togglePinnedSection,
    }
})
