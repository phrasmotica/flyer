<script setup lang="ts">
import { RouterView } from 'vue-router'
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
