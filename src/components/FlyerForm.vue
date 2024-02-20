<script setup lang="ts">
import { computed, onMounted, ref } from "vue"

import PlayerNameInput from "./PlayerNameInput.vue"
import ConfirmStartModal from "./ConfirmStartModal.vue"

import { RoundRobinScheduler } from "../data/RoundRobinScheduler"

const props = defineProps<{
    players: string[]
}>()

const emit = defineEmits<{
    start: [players: string[], raceTo: number, tableCount: number]
    setName: [index: number, name: string]
    reset: []
}>()

const playerCount = ref(props.players.filter(p => p).length)
const format = ref('Round Robin')
const formatOptions = ref(['Round Robin'])
const raceTo = ref(1)
const tableCount = ref(1)
const showModal = ref(false)

const estimatedDuration = computed(() => new RoundRobinScheduler([]).estimateDuration(playerCount.value, raceTo.value, tableCount.value))
const durationPerFrame = new RoundRobinScheduler([]).frameTimeEstimateMins

// hack to stop InputNumber elements from focusing after pressing their buttons.
// Important for mobile UX
onMounted(() => {
    const buttons = document.getElementsByClassName("p-inputnumber-button")
    for (const b of buttons) {
        b.addEventListener("mouseup", () => {
            (<any>document.activeElement)?.blur()
        })
    }
})

const actualPlayers = computed(() => props.players.slice(0, playerCount.value))

const confirmStart = () => {
    showModal.value = true
}

const start = () => {
    emit('start', actualPlayers.value, raceTo.value, tableCount.value)
    hideModal()
}

const hideModal = () => {
    showModal.value = false
}
</script>

<template>
    <h1 class="border-bottom-1 mb-2">Format</h1>

    <div class="p-fluid mb-2">
        <InputNumber
            v-model="raceTo"
            showButtons buttonLayout="horizontal"
            :min="1" :max="5"
            prefix="Races to "
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
            v-model="tableCount"
            showButtons buttonLayout="horizontal"
            :min="1" :max="Math.floor(playerCount / 2)"
            suffix=" table(s)"
            :inputStyle="{ 'text-align': 'center', 'font-weight': 'bold' }">
            <template #incrementbuttonicon>
                <span class="pi pi-plus" />
            </template>
            <template #decrementbuttonicon>
                <span class="pi pi-minus" />
            </template>
        </InputNumber>
    </div>

    <!-- TODO: allow selecting round-robin (existing) or knockout format (implement that!) -->
    <div class="p-fluid mb-2">
        <SelectButton v-model="format" :options="formatOptions" :allowEmpty="false" aria-labelledby="basic" />
    </div>

    <div class="p-fluid mb-2">
        <p>Estimated duration: {{ estimatedDuration }} min(s) <em>({{ durationPerFrame }} min(s) per frame)</em></p>
    </div>

    <h1 class="border-bottom-1 mb-2">Players</h1>

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

    <div v-for="p, i in players">
        <PlayerNameInput
            class="mb-2"
            :placeholder="'Player ' + (i + 1)"
            :disabled="i >= playerCount"
            :name="p"
            @setName="n => emit('setName', i, n)" />
    </div>

    <div class="p-fluid">
        <Button label="Start" :disabled="actualPlayers.some(p => !p)" @click="confirmStart" />
    </div>

    <ConfirmStartModal
        :visible="showModal"
        @start="start"
        @cancel="hideModal" />
</template>

<style>
.p-inputnumber-button.p-disabled {
    pointer-events: auto;
}
</style>
