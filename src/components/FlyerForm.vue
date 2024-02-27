<script setup lang="ts">
import { computed, onMounted, ref, watch } from "vue"

import FlyerFormSection from "./FlyerFormSection.vue"
import LabelledCheckbox from "./LabelledCheckbox.vue"
import LabelledSlider from "./LabelledSlider.vue"
import PlayerNameInput from "./PlayerNameInput.vue"

import { Format, RuleSet } from "../data/FlyerSettings"

import { useSettingsStore } from "../stores/settings"

const maxPlayersEnv = Number(import.meta.env.VITE_MAX_PLAYERS)
const maxRaceEnv = Number(import.meta.env.VITE_MAX_RACE)

const settingsStore = useSettingsStore()

watch(() => settingsStore.settings.playerCount, () => {
    if (settingsStore.settings.tableCount > Math.floor(settingsStore.settings.playerCount / 2)) {
        settingsStore.settings.tableCount = Math.floor(settingsStore.settings.playerCount / 2)
    }
})

watch(() => settingsStore.settings.format, () => {
    if (settingsStore.settings.format === Format.Knockout) {
        settingsStore.settings.requireCompletedRounds = true
        settingsStore.settings.allowEarlyFinish = false
        settingsStore.settings.allowDraws = false
    }

    if (settingsStore.settings.format === Format.RoundRobin) {
        settingsStore.settings.randomlyDrawAllRounds = false
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
    <FlyerFormSection header="Settings">
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

        <LabelledCheckbox
            label="Randomly draw all rounds"
            v-model="settingsStore.settings.randomlyDrawAllRounds"
            :disabled="!isKnockout" />

        <LabelledCheckbox
            label="Require completed rounds"
            v-model="settingsStore.settings.requireCompletedRounds"
            :disabled="isKnockout" />

        <LabelledCheckbox
            label="Allow early finish"
            v-model="settingsStore.settings.allowEarlyFinish"
            :disabled="isKnockout" />

        <LabelledCheckbox
            label="Allow draws"
            v-model="settingsStore.settings.allowDraws"
            :disabled="isKnockout" />
    </FlyerFormSection>

    <FlyerFormSection header="Prizes">
        <LabelledCheckbox
            label="Entry fee required"
            v-model="settingsStore.settings.entryFeeRequired" />

        <div class="p-fluid mb-2">
            <InputNumber
                v-model="settingsStore.settings.entryFee"
                showButtons buttonLayout="horizontal"
                :min="5" :max="20" :step="5"
                mode="currency" currency="GBP" locale="en-GB"
                suffix=" entry fee"
                inputClass="text-center font-bold"
                :disabled="!settingsStore.settings.entryFeeRequired">
                <template #incrementbuttonicon>
                    <span class="pi pi-plus" />
                </template>
                <template #decrementbuttonicon>
                    <span class="pi pi-minus" />
                </template>
            </InputNumber>
        </div>
    </FlyerFormSection>

    <FlyerFormSection header="Players">
        <div class="p-fluid mb-2 md:hidden">
            <InputNumber
                v-model="settingsStore.settings.playerCount"
                showButtons buttonLayout="horizontal"
                :min="2" :max="maxPlayersEnv"
                suffix=" players"
                inputClass="text-center font-bold">
                <template #incrementbuttonicon>
                    <span class="pi pi-plus" />
                </template>
                <template #decrementbuttonicon>
                    <span class="pi pi-minus" />
                </template>
            </InputNumber>
        </div>

        <div class="mt-2 hidden md:block">
            <LabelledSlider
                v-model="settingsStore.settings.playerCount"
                :min="2" :max="maxPlayersEnv" />
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
    </FlyerFormSection>
</template>

<style>
.p-inputnumber-button.p-disabled {
    pointer-events: auto;
}
</style>
