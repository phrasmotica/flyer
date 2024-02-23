<script setup lang="ts">
import { computed } from "vue"

import { useFlyerStore } from "../stores/flyer"
import { usePlayersStore } from "../stores/players"

const flyerStore = useFlyerStore()
const playersStore = usePlayersStore()

const winnerName = computed(() => playersStore.getName(flyerStore.winner))
</script>

<template>
    <h1 class="border-bottom-1">Results</h1>

    <p>Took {{ flyerStore.durationMinutes }} minute(s)</p>

    <div class="text-center">
        <p>The winner is</p>
        <h1>{{ winnerName }}</h1>
    </div>
</template>

<style scoped>
h3 {
    margin: 0px;
}
</style>
