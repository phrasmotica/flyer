<script setup lang="ts">
import { computed, useSlots, watch } from "vue"

import UiThemeButton from "./theming/UiThemeButton.vue"

import { useScreenSizes } from "@/composables/useScreenSizes"

import { useFlyer } from "@/composables/useFlyer"
import { useFlyerStore } from "@/stores/flyer"
import { useUiStore } from "@/stores/ui"

const flyerStore = useFlyerStore()
const uiStore = useUiStore()

const {
    currentPhase,
} = useFlyer(flyerStore.flyer)

const slots = useSlots()

const {
    isSmallScreen,
} = useScreenSizes()

watch(() => currentPhase.value?.eventLog, () => {
    // HIGH: create a toast for EVERY default-level event that
    // gets created. Only store the relevant data in each phase event object,
    // rather than a readable and localised message. Create the localised
    // message here
})

const headerSize = computed(() => isSmallScreen.value ? "text-2xl" : "text-4xl")
</script>

<template>
    <!-- LOW: make this better. This isn't great on wide screens,
    plus it'd be better to not have two scroll bars... -->
    <!-- MEDIUM: set a sensible max height for everything -->
    <main class="flex flex-column justify-content-between">
        <Toast />

        <div class="content overflow-y-auto pt-3 px-3">
            <div v-if="slots.header" class="border-bottom-1 mb-2">
                <div v-if="isSmallScreen && slots.subHeaderLeft">
                    <div :class="headerSize">
                        <slot name="header" />
                    </div>

                    <div class="flex align-items-end pb-1">
                        <slot name="subHeaderLeft" />

                        <div class="flex gap-1 flex-grow-1 justify-content-end">
                            <slot name="headerButtons" />

                            <UiThemeButton />
                        </div>
                    </div>
                </div>

                <div v-else>
                    <div class="flex align-items-end justify-content-between">
                        <div :class="headerSize">
                            <slot name="header" />
                        </div>

                        <div class="flex gap-2 align-items-end mb-1">
                            <slot name="subHeaderLeft" />

                            <div class="flex gap-1">
                                <slot name="headerButtons" />

                                <UiThemeButton />
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div v-if="slots.sidebar">
                <div v-if="uiStore.isSidebarRight" class="grid m-0">
                    <div class="col-8 p-0 pr-2">
                        <slot name="content" />
                    </div>

                    <div class="col-4 p-0 pl-2 border-left-1">
                        <slot name="sidebar" />
                    </div>
                </div>

                <div v-if="uiStore.isSidebarLeft" class="grid m-0">
                    <div class="col-4 p-0 pr-2 border-right-1">
                        <slot name="sidebar" />
                    </div>

                    <div class="col-8 p-0 pl-2">
                        <slot name="content" />
                    </div>
                </div>
            </div>
            <div v-else>
                <slot name="content" />
            </div>

            <slot name="modals" />
        </div>

        <div v-if="slots.buttons" class="nav-buttons p-fluid p-3">
            <slot name="buttons" />
        </div>
    </main>
</template>

<style>
main {
    height: 100dvh;
}

.nav-buttons > .p-button:last-child {
    margin-bottom: 0!important;
}

@media screen and (max-width: 767px) {
    main {
        width: 100%;
    }
}

@media screen and (min-width: 768px) {
    main {
        width: 768px;
    }
}
</style>
