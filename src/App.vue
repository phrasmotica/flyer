<script setup lang="ts">
import { watch } from "vue"
import { RouterView } from 'vue-router'
import { useDark } from "@vueuse/core"
import { usePrimeVue } from 'primevue/config'

const isDark = useDark()

const primeVue = usePrimeVue()

const lightTheme = "aura-light-green"
const darkTheme = "aura-dark-green"

watch(isDark, () => {
    if (isDark.value) {
        primeVue.changeTheme(lightTheme, darkTheme, 'theme-link', () => {})
    }
    else {
        primeVue.changeTheme(darkTheme, lightTheme, 'theme-link', () => {})
    }
})
</script>

<template>
    <RouterView />

    <footer class="w-full text-center">
        <a href="https://www.flaticon.com/free-icons/ball-eight" title="ball eight icons">Ball eight icons created by Boris farias - Flaticon</a>
    </footer>
</template>

<style>
footer {
    transition: color 0.5s, background-color 0.5s;
    background-color: seashell!important;
}

@media (prefers-color-scheme: dark) {
    footer {
        background-color: rgb(68, 60, 53)!important;
    }
}
</style>
