<script setup lang="ts">
import { watch } from "vue"
import { RouterView } from 'vue-router'
import { useDark } from "@vueuse/core"
import { usePrimeVue } from 'primevue/config'

import { useUiStore } from "./stores/ui"

const uiStore = useUiStore()

const isDark = useDark()

const PrimeVue = usePrimeVue()

const lightBaseTheme = "aura-light-green"
const darkBaseTheme = "aura-dark-green"

const lightTheme = "flyer-light"
const darkTheme = "flyer-dark"

const setDark = () => {
    let newBaseTheme = isDark.value ? darkBaseTheme : lightBaseTheme
    PrimeVue.changeTheme(uiStore.baseColourTheme, newBaseTheme, 'theme-link-base', () => {})
    uiStore.settings.baseColourTheme = newBaseTheme

    let newTheme = isDark.value ? darkTheme : lightTheme
    PrimeVue.changeTheme(uiStore.colourTheme, newTheme, 'theme-link-flyer', () => {})
    uiStore.settings.colourTheme = newTheme
}

setDark()

watch(isDark, () => {
    setDark()
})
</script>

<template>
    <RouterView />

    <footer class="w-full text-center">
        <a href="https://www.flaticon.com/free-icons/ball-eight" title="ball eight icons">Ball eight icons created by Boris farias - Flaticon</a>
    </footer>
</template>
