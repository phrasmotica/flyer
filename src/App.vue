<script setup lang="ts">
import { onMounted, watch } from "vue"
import { RouterView } from 'vue-router'
import { useDark } from "@vueuse/core"
import { usePrimeVue } from 'primevue/config'

import { useUiStore } from "@/stores/ui"

const uiStore = useUiStore()

const isDark = useDark()

const PrimeVue = usePrimeVue()

const lightBaseTheme = "aura-light-green"
const darkBaseTheme = "aura-dark-green"

const lightTheme = "flyer-light-green"
const darkTheme = "flyer-dark-green"

const setDark = (initial: boolean) => {
    console.debug("Dark " + isDark.value)

    // on initial load, the theme links will always point to the light themes
    const oldBaseTheme = initial ? lightBaseTheme : uiStore.baseColourTheme
    const newBaseTheme = isDark.value ? darkBaseTheme : lightBaseTheme

    console.debug("Base link before: " + document.getElementById("theme-link-base")!.getAttribute("href"))
    PrimeVue.changeTheme(oldBaseTheme, newBaseTheme, 'theme-link-base', () => {
        console.debug("Base link after: " + document.getElementById("theme-link-base")!.getAttribute("href"))
    })

    uiStore.settings.baseColourTheme = newBaseTheme

    const oldTheme = initial ? lightTheme : uiStore.colourTheme
    const newTheme = isDark.value ? darkTheme : lightTheme

    console.debug("Flyer link before: " + document.getElementById("theme-link-flyer")!.getAttribute("href"))
    PrimeVue.changeTheme(oldTheme, newTheme, 'theme-link-flyer', () => {
        console.debug("Flyer link after: " + document.getElementById("theme-link-flyer")!.getAttribute("href"))
    })

    uiStore.settings.colourTheme = newTheme
}

onMounted(() => {
    setDark(true)
})

watch(isDark, () => {
    setDark(false)
})
</script>

<template>
    <RouterView />

    <footer class="w-full text-center">
        <a href="https://www.flaticon.com/free-icons/ball-eight" title="ball eight icons">Ball eight icons created by Boris farias - Flaticon</a>
    </footer>
</template>
