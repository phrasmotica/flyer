<script setup lang="ts">
import { useSlots } from "vue"

import { useUiStore } from "../stores/ui"

const uiStore = useUiStore()

const slots = useSlots()
</script>

<template>
    <!-- LOW: make this better. This isn't great on wide screens,
    plus it'd be better to not have two scroll bars... -->
    <!-- MEDIUM: set a sensible max height for everything -->
    <main class="flex flex-column justify-content-between">
        <Toast />

        <div class="content overflow-y-auto mt-3 mx-3 pt-3 px-3">
            <div v-if="slots.header" class="border-bottom-1 mb-2">
                <slot name="header" />

                <!-- TODO: add a slot for header buttons -->

                <!-- TODO: add a button for customising UI appearance in a
                modal. Light/dark mode, colour theme, sidebar position, etc.
                This should appear for all screen sizes -->
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

.nav-buttons {
    transition: color 0.5s, background-color 0.5s;
    background-color: seashell!important;
}

.nav-buttons > .p-button:last-child {
    margin-bottom: 0!important;
}

@media (prefers-color-scheme: dark) {
    .nav-buttons {
        background-color: rgb(68, 60, 53)!important;
    }
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
