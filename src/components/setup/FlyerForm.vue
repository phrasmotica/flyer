<script setup lang="ts">
import { computed, onUpdated } from "vue"
import type { MenuItem } from "primevue/menuitem"

import PlayersSection from "./PlayersSection.vue"
import PrizesSection from "./PrizesSection.vue"
import SettingsSection from "./SettingsSection.vue"
import TablesSection from "./TablesSection.vue"

import { useTweaks } from "@/composables/useTweaks"

import { FlyerFormSection } from "@/data/UiSettings"

import { useUiStore } from "@/stores/ui"

const uiStore = useUiStore()

const { blurNumberInputs } = useTweaks()

const items = computed(() => <MenuItem[]>[
    {
        icon: 'pi pi-user',
        command: _ => uiStore.settings.flyerFormSection = FlyerFormSection.Players,
    },
    {
        icon: 'pi pi-book',
        command: _ => uiStore.settings.flyerFormSection = FlyerFormSection.Settings,
    },
    {
        icon: 'pi pi-building',
        command: _ => uiStore.settings.flyerFormSection = FlyerFormSection.Tables,
    },
    {
        icon: 'pi pi-pound',
        command: _ => uiStore.settings.flyerFormSection = FlyerFormSection.Prizes,
    },
])

onUpdated(() => {
    blurNumberInputs("form-content")
})
</script>

<template>
    <div>
        <TabMenu
            class="mb-2"
            :model="items"
            :activeIndex="uiStore.flyerFormSection" />

        <!-- LOW: only make the form content overflow with a scroll bar, not the tab menu also -->
        <div id="form-content">
            <div v-if="uiStore.flyerFormSection === FlyerFormSection.Players">
                <PlayersSection />
            </div>

            <div v-if="uiStore.flyerFormSection === FlyerFormSection.Settings">
                <SettingsSection />
            </div>

            <div v-if="uiStore.flyerFormSection === FlyerFormSection.Tables">
                <TablesSection />
            </div>

            <div v-if="uiStore.flyerFormSection === FlyerFormSection.Prizes">
                <PrizesSection />
            </div>
        </div>
    </div>
</template>

<style>
.p-inputnumber-button.p-disabled {
    pointer-events: auto;
}

.p-tabmenu .p-tabmenu-nav {
    background: var(--color-background);
    transition: background-color 0.5s;
}

.p-tabmenu .p-tabmenu-nav .p-tabmenuitem {
    background: var(--color-background);
    flex: 1;
    justify-content: center;
    transition: background-color 0.5s;
}

.p-tabmenu .p-tabmenu-nav .p-tabmenuitem .p-menuitem-link {
    background: var(--color-background);
    color: var(--color-text);
    justify-content: center;
    transition: background-color 0.5s;
}

.p-tabmenu .p-tabmenu-nav .p-tabmenuitem .p-menuitem-link .p-menuitem-icon {
    margin-right: 0;
    font-size: 1.5rem;
    padding-bottom: 0.125rem;
}

.p-selectbutton .p-button .pi, .p-selectbutton .p-button .p-button-label {
    font-size: 12px;
}
</style>
