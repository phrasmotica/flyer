<script setup lang="ts">
import ScoreCell from "./ScoreCell.vue"

import { useFlyer } from "../composables/useFlyer"

import type { Fixture } from "../data/Fixture"

import { useFlyerStore } from "../stores/flyer"

const score = defineModel<number>("score")
const runouts = defineModel<number>("runouts")

const props = defineProps<{
    fixture: Fixture
    playerId: string
    isWinner: boolean
    finished?: boolean
}>()

const flyerStore = useFlyerStore()

const {
    settings,
    getPlayerName,
} = useFlyer(flyerStore.flyer?.phases[0] || null)
</script>

<template>
    <div class="flex flex-column align-items-center">
        <div class="font-bold">
            {{ getPlayerName(props.playerId) }}
        </div>

        <div v-if="props.finished">
            <ScoreCell
                large
                static
                :fixture="props.fixture"
                :score="score"
                :isWinner="props.isWinner" />
        </div>

        <InputNumber v-else
            showButtons
            inputClass="w-4rem text-2xl font-bold py-1"
            buttonLayout="vertical"
            v-model="score"
            :min="0" :max="settings.raceTo">
            <template #incrementbuttonicon>
                <span class="pi pi-plus" />
            </template>
            <template #decrementbuttonicon>
                <span class="pi pi-minus" />
            </template>
        </InputNumber>

        <div class="text-xs mt-2">
            Runouts
        </div>

        <div v-if="props.finished">
            <Badge :value="runouts" severity="contrast" />
        </div>

        <InputNumber v-else
            class="runout-stepper"
            showButtons
            inputClass="w-2rem px-1 text-center"
            buttonLayout="horizontal"
            v-model="runouts"
            :min="0" :max="settings.raceTo">
            <template #incrementbuttonicon>
                <span class="pi pi-plus" />
            </template>
            <template #decrementbuttonicon>
                <span class="pi pi-minus" />
            </template>
        </InputNumber>
    </div>
</template>

<style>
.runout-stepper > * {
    padding-top: 0.25rem;
    padding-bottom: 0.25rem;
}

.runout-stepper > button.p-inputnumber-button {
    width: unset;
    padding: 0rem 0.5rem;
}

.runout-stepper > button.p-inputnumber-button > span.pi {
    font-size: 0.75rem;
}
</style>
