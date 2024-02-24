<script setup lang="ts">
import { computed, onMounted } from "vue"

import PlayerNameInput from "./PlayerNameInput.vue"

import { Format, useSettingsStore } from "../stores/settings"

const settingsStore = useSettingsStore()

const isKnockout = computed(() => settingsStore.format === Format.Knockout)

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
</script>

<template>
    <h1 class="border-bottom-1 mb-2">Format</h1>

    <div class="p-fluid mb-2">
        <InputNumber
            v-model="settingsStore.raceTo"
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
            v-model="settingsStore.tableCount"
            showButtons buttonLayout="horizontal"
            :min="1" :max="Math.floor(settingsStore.playerCount / 2)"
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

    <div class="p-fluid mb-2">
        <SelectButton v-model="settingsStore.format" :options="settingsStore.formatOptions" :allowEmpty="false" aria-labelledby="basic" />
    </div>

    <div class="p-fluid flex justify-content-between mb-2">
        <label for="requireCompletedRoundsCheckbox" :class="[isKnockout && 'text-color-secondary']">
            Require completed rounds
        </label>

        <Checkbox
            inputId="requireCompletedRoundsCheckbox"
            v-model="settingsStore.requireCompletedRounds"
            :binary="true"
            :disabled="isKnockout" />
    </div>

    <div class="p-fluid flex justify-content-between mb-2">
        <label for="allowEarlyFinishCheckbox" :class="[isKnockout && 'text-color-secondary']">
            Allow early finish
        </label>

        <Checkbox
            inputId="allowEarlyFinishCheckbox"
            v-model="settingsStore.allowEarlyFinish"
            :binary="true"
            :disabled="isKnockout" />
    </div>

    <div class="p-fluid border-top-1 mb-2">
        <p>
            Estimated duration: <span class="font-bold">{{ settingsStore.estimatedDuration }} min(s)</span> <em>({{ settingsStore.durationPerFrame }} min(s) per frame)</em>
        </p>
    </div>

    <h1 class="border-bottom-1 mb-2">Players</h1>

    <div class="p-fluid mb-2">
        <InputNumber
            v-model="settingsStore.playerCount"
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

    <div v-for="p, i in settingsStore.playerNames">
        <PlayerNameInput
            class="mb-2"
            :placeholder="'Player ' + (i + 1)"
            :disabled="i >= settingsStore.playerCount"
            :name="p"
            @setName="n => settingsStore.setName(i, n)" />
    </div>
</template>

<style>
.p-inputnumber-button.p-disabled {
    pointer-events: auto;
}
</style>
