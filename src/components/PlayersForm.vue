<script setup lang="ts">
import { computed, ref } from "vue"

import PlayerNameInput from "../components/PlayerNameInput.vue"

const props = defineProps<{
    players: string[]
}>()

const emit = defineEmits<{
    start: [players: string[]]
    setName: [index: number, name: string]
    reset: []
}>()

const playerCount = ref(4)

const actualPlayers = computed(() => props.players.slice(0, playerCount.value))

const start = () => emit('start', actualPlayers.value)
</script>

<template>
    <div class="d-flex justify-content-between mb-2">
        <h3>Players</h3>

        <InputNumber
            v-model="playerCount"
            showButtons buttonLayout="horizontal"
            :min="2" :max="10"
            suffix=" players">
            <template #incrementbuttonicon>
                <span class="pi pi-plus" />
            </template>
            <template #decrementbuttonicon>
                <span class="pi pi-minus" />
            </template>
        </InputNumber>
    </div>

    <div v-for="p, i in players">
        <PlayerNameInput
            class="mb-2"
            :placeholder="'Player ' + (i + 1)"
            :disabled="i >= playerCount"
            :name="p"
            @setName="n => emit('setName', i, n)" />
    </div>

    <Button class="w-100" label="Start" :disabled="actualPlayers.some(p => !p)" @click="start" />
</template>
