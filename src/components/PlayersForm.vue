<script setup lang="ts">
import { computed, ref } from "vue"

import PlayerNameInput from "../components/PlayerNameInput.vue"

const props = defineProps<{
    players: string[]
}>()

const emit = defineEmits<{
    start: [players: string[], raceTo: number]
    setName: [index: number, name: string]
    reset: []
}>()

const playerCount = ref(4)
const raceTo = ref(3)

const actualPlayers = computed(() => props.players.slice(0, playerCount.value))

const start = () => emit('start', actualPlayers.value, raceTo.value)
</script>

<template>
    <h1>Players</h1>

    <div class="p-fluid mb-2">
        <InputNumber
            v-model="playerCount"
            showButtons buttonLayout="horizontal"
            :min="2" :max="10"
            suffix=" players"
            :inputStyle="{ 'text-align': 'center', 'font-weight': 'bold' }">
            <template #incrementbuttonicon>
                <span class="pi pi-plus" />
            </template>
            <template #decrementbuttonicon>
                <span class="pi pi-minus" />
            </template>
        </InputNumber>
    </div>

    <div class="p-fluid mb-2">
        <InputNumber
            v-model="raceTo"
            showButtons buttonLayout="horizontal"
            :min="1" :max="5"
            prefix="Race to "
            :inputStyle="{ 'text-align': 'center', 'font-weight': 'bold' }">
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

    <div class="p-fluid">
        <Button label="Start" :disabled="actualPlayers.some(p => !p)" @click="start" />
    </div>
</template>
