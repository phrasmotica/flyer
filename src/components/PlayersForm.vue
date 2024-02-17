<script setup lang="ts">
import { computed, ref } from "vue"

import PlayerNameInput from "../components/PlayerNameInput.vue"

const emit = defineEmits<{
    start: [players: string[]]
}>()

const DEFAULT_PLAYERS = ["Julian", "Roy", "Emile", "Luis", "", "", "", "", "", ""]

const playerCount = ref(4)
const players = ref(DEFAULT_PLAYERS)

const setPlayerCount = (count: number) => playerCount.value = count

const setName = (index: number, name: string) => {
    players.value = players.value.map((v, i) => i === index ? name : v)
}

const actualPlayers = computed(() => players.value.slice(0, playerCount.value))

const start = () => emit('start', actualPlayers.value)

const reset = () => {
    players.value = DEFAULT_PLAYERS
}
</script>

<template>
    <div class="d-flex justify-content-between mb-2">
        <h3>Players</h3>

        <input class="form-control w-auto" type="number" min="2" max="10" :value="playerCount" @input="(e: any) => setPlayerCount(Number(e.target.value))" />
    </div>

    <div v-for="p, i in players">
        <PlayerNameInput
            class="mb-2" 
            :placeholder="'Player ' + (i + 1)" 
            :disabled="i >= playerCount" 
            :name="p" 
            @setName="n => setName(i, n)" />
    </div>

    <div class="btn-group w-100">
        <button 
            class="btn btn-success" 
            :disabled="actualPlayers.some(p => !p)"
            @click="start">Start</button>

        <button 
            class="btn btn-danger" 
            :disabled="actualPlayers.every(p => !p)"
            @click="reset">Reset</button>
    </div>
</template>
