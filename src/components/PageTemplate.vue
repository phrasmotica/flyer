<script setup lang="ts">
import { useSlots } from "vue"

const slots = useSlots()
</script>

<template>
    <!-- TODO: make this better. This isn't great on wide screens,
    plus it'd be better to not have two scroll bars... -->
    <main class="flex flex-column justify-content-between">
        <div class="content overflow-y-auto mt-3 mx-3 pt-3 px-3">
            <slot name="content" />
        </div>

        <!-- TODO: put these in a PrimeVue Sidebar component -->
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
        width: 600px;
    }
}
</style>
