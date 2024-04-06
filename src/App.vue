<script setup lang="ts">
import { watch } from "vue"
import { RouterView } from 'vue-router'
import { useDark } from "@vueuse/core"
import { usePrimeVue } from 'primevue/config'

import { useUiStore } from "./stores/ui"

const uiStore = useUiStore()

const isDark = useDark()

const PrimeVue = usePrimeVue()

const lightTheme = "aura-light-green"
const darkTheme = "aura-dark-green"

const setDark = () => {
    let newTheme = isDark.value ? darkTheme : lightTheme

    PrimeVue.changeTheme(uiStore.colourTheme, newTheme, 'theme-link', () => {})

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
