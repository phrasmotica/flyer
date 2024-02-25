<script setup lang="ts">
import { computed, onMounted, watch } from "vue"

import PlayerNameInput from "./PlayerNameInput.vue"

import { Format } from "../data/FlyerSettings"

import { useSettingsStore } from "../stores/settings"

const settingsStore = useSettingsStore()

watch(settingsStore.settings, () => {
    if (settingsStore.settings.format === Format.Knockout) {
        settingsStore.settings.requireCompletedRounds = true
        settingsStore.settings.allowEarlyFinish = false
    }
})

const isKnockout = computed(() => settingsStore.settings.format === Format.Knockout)

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
    <h2 class="border-bottom-1 border-gray-200 mb-2">Format</h2>

    <div class="p-fluid mb-2">
        <InputNumber
            v-model="settingsStore.settings.raceTo"
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
            v-model="settingsStore.settings.tableCount"
            showButtons buttonLayout="horizontal"
            :min="1" :max="Math.floor(settingsStore.settings.playerCount / 2)"
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
        <SelectButton v-model="settingsStore.settings.format" :options="[Format.Knockout, Format.RoundRobin]" :allowEmpty="false" aria-labelledby="basic" />
    </div>

    <div class="p-fluid flex justify-content-between mb-2">
        <label for="requireCompletedRoundsCheckbox" :class="[isKnockout && 'text-color-secondary']">
            Require completed rounds
        </label>

        <Checkbox
            inputId="requireCompletedRoundsCheckbox"
            v-model="settingsStore.settings.requireCompletedRounds"
            :binary="true"
            :disabled="isKnockout" />
    </div>

    <div class="p-fluid flex justify-content-between mb-2">
        <label for="allowEarlyFinishCheckbox" :class="[isKnockout && 'text-color-secondary']">
            Allow early finish
        </label>

        <Checkbox
            inputId="allowEarlyFinishCheckbox"
            v-model="settingsStore.settings.allowEarlyFinish"
            :binary="true"
            :disabled="isKnockout" />
    </div>

    <div class="p-fluid mb-2">
        <!-- TODO: move this into the nav button box -->
        <p>
            Estimated duration: <span class="font-bold">{{ settingsStore.estimatedDuration }} min(s)</span> <em>({{ settingsStore.durationPerFrame }} min(s) per frame)</em>
        </p>
    </div>

    <h2 class="border-bottom-1 border-gray-200 mb-2">Players</h2>

    <div class="p-fluid mb-2">
        <InputNumber
            v-model="settingsStore.settings.playerCount"
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

    <div v-for="p, i in settingsStore.settings.playerNames">
        <PlayerNameInput
            class="mb-2"
            :placeholder="'Player ' + (i + 1)"
            :disabled="i >= settingsStore.settings.playerCount"
            :name="p"
            @setName="n => settingsStore.setName(i, n)" />
    </div>
</template>

<style>
.p-inputnumber-button.p-disabled {
    pointer-events: auto;
}
</style>
