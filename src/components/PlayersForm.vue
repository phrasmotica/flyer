<script setup lang="ts">
import { computed } from "vue"

import PlayerNameInput from "../components/PlayerNameInput.vue"

const props = defineProps<{
    players: string[]
    playerCount: number
}>()

const emit = defineEmits<{
    start: [players: string[]]
    setPlayerCount: [count: number]
    setName: [index: number, name: string]
    reset: []
}>()

const actualPlayers = computed(() => props.players.slice(0, props.playerCount))

const start = () => emit('start', actualPlayers.value)
</script>

<template>
    <div class="d-flex justify-content-between mb-2">
        <h3>Players</h3>

        <input
            class="form-control w-auto"
            type="number"
            min="2" max="10"
            :value="props.playerCount"
            @input="(e: any) => emit('setPlayerCount', Number(e.target.value))" />
    </div>

    <div v-for="p, i in players">
        <PlayerNameInput
            class="mb-2"
            :placeholder="'Player ' + (i + 1)"
            :disabled="i >= props.playerCount"
            :name="p"
            @setName="n => emit('setName', i, n)" />
    </div>

    <button
        class="btn btn-success w-100"
        :disabled="actualPlayers.some(p => !p)"
        @click="start">Start</button>
</template>
