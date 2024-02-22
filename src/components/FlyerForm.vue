<script setup lang="ts">
import { onMounted, ref } from "vue"

import ConfirmModal from "./ConfirmModal.vue"
import PlayerNameInput from "./PlayerNameInput.vue"

import { useFlyerStore } from "../stores/flyer"

const flyerStore = useFlyerStore()

const emit = defineEmits<{
    start: []
}>()

const showModal = ref(false)

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

const confirmStart = () => {
    showModal.value = true
}

const start = () => {
    emit('start')
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
            v-model="flyerStore.raceTo"
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
            v-model="flyerStore.tableCount"
            showButtons buttonLayout="horizontal"
            :min="1" :max="Math.floor(flyerStore.playerCount / 2)"
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
        <SelectButton v-model="flyerStore.format" :options="flyerStore.formatOptions" :allowEmpty="false" aria-labelledby="basic" />
    </div>

    <div class="p-fluid flex justify-content-between mb-2">
        <label for="requireCompletedRoundsCheckbox">Require completed rounds</label>
        <Checkbox inputId="requireCompletedRoundsCheckbox" v-model="flyerStore.requireCompletedRounds" :binary="true" />
    </div>

    <div class="p-fluid flex justify-content-between mb-2">
        <label for="allowEarlyFinishCheckbox">Allow early finish</label>
        <Checkbox inputId="allowEarlyFinishCheckbox" v-model="flyerStore.allowEarlyFinish" :binary="true" />
    </div>

    <div class="p-fluid border-top-1 mb-2">
        <p>
            Estimated duration: <span class="font-bold">{{ flyerStore.estimatedDuration }} min(s)</span> <em>({{ flyerStore.durationPerFrame }} min(s) per frame)</em>
        </p>
    </div>

    <h1 class="border-bottom-1 mb-2">Players</h1>

    <div class="p-fluid mb-2">
        <InputNumber
            v-model="flyerStore.playerCount"
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

    <div v-for="p, i in flyerStore.players">
        <PlayerNameInput
            class="mb-2"
            :placeholder="'Player ' + (i + 1)"
            :disabled="i >= flyerStore.playerCount"
            :name="p"
            @setName="n => flyerStore.setName(i, n)" />
    </div>

    <div class="p-fluid">
        <Button label="Start" :disabled="flyerStore.isInvalid" @click="confirmStart" />
    </div>

    <ConfirmModal
        :visible="showModal"
        header="Start Flyer"
        message="Are you ready to start the flyer?"
        @confirm="start"
        @hide="hideModal" />
</template>

<style>
.p-inputnumber-button.p-disabled {
    pointer-events: auto;
}
</style>
