<script setup lang="ts">
import { computed, onMounted, watch } from "vue"

import PlayerNameInput from "./PlayerNameInput.vue"

import { Format, RuleSet } from "../data/FlyerSettings"

import { useSettingsStore } from "../stores/settings"

const maxPlayersEnv = Number(import.meta.env.VITE_MAX_PLAYERS)
const maxRaceEnv = Number(import.meta.env.VITE_MAX_RACE)

const settingsStore = useSettingsStore()

watch(() => settingsStore.settings.format, () => {
    if (settingsStore.settings.format === Format.Knockout) {
        settingsStore.settings.requireCompletedRounds = true
        settingsStore.settings.allowEarlyFinish = false
        settingsStore.settings.allowDraws = false
    }

    if (settingsStore.settings.format === Format.RoundRobin) {
        settingsStore.settings.requireCompletedRounds = false
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
    <h2 class="border-bottom-1 border-gray-200 mb-2">Settings</h2>

    <div class="p-fluid mb-2">
        <InputNumber
            v-model="settingsStore.settings.raceTo"
            showButtons buttonLayout="horizontal"
            :min="1" :max="maxRaceEnv"
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

    <div class="grid m-0 mb-2">
        <div class="col-12 md:col-6 mb-2 md:mb-0 p-0 p-fluid">
            <div class="md:mr-1">
                <label for="formatDropdown" class="font-bold">Format</label>
                <Dropdown
                    inputId="formatDropdown"
                    v-model="settingsStore.settings.format"
                    :options="[Format.Knockout, Format.RoundRobin]" />
            </div>
        </div>

        <div class="col-12 md:col-6 p-0 p-fluid">
            <div class="md:ml-1">
                <label for="ruleSetDropdown" class="font-bold">Rules</label>
                <Dropdown
                    inputId="ruleSetDropdown"
                    v-model="settingsStore.settings.ruleSet"
                    :options="[RuleSet.Blackball, RuleSet.International]" />
            </div>
        </div>
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

    <div class="p-fluid flex justify-content-between mb-2">
        <label for="allowDrawsCheckbox" :class="[isKnockout && 'text-color-secondary']">
            Allow draws
        </label>

        <Checkbox
            inputId="allowDrawsCheckbox"
            v-model="settingsStore.settings.allowDraws"
            :binary="true"
            :disabled="isKnockout" />
    </div>

    <h2 class="border-bottom-1 border-gray-200 mb-2">Players</h2>

    <div class="p-fluid mb-2">
        <InputNumber
            v-model="settingsStore.settings.playerCount"
            showButtons buttonLayout="horizontal"
            :min="2" :max="maxPlayersEnv"
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
        <div class="flex mb-2">
            <PlayerNameInput
                class="flex-grow-1"
                :placeholder="'Player ' + (i + 1)"
                :disabled="i >= settingsStore.settings.playerCount"
                :name="p"
                @setName="n => settingsStore.setName(i, n)" />

            <Button
                class="ml-2"
                icon="pi pi-trash"
                severity="danger"
                :disabled="settingsStore.settings.playerCount <= 2 || i >= settingsStore.settings.playerCount"
                @click="() => settingsStore.deleteName(i)" />
        </div>
    </div>
</template>

<style>
.p-inputnumber-button.p-disabled {
    pointer-events: auto;
}
</style>
