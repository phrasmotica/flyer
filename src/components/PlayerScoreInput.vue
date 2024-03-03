<script setup lang="ts">
import { ref, watch } from "vue"

import { useFlyerStore } from "../stores/flyer"

const props = defineProps<{
    playerId: string
    score: number
    runouts: number // TODO: encapsulate score and runouts in a single object
    finished?: boolean
}>()

const emit = defineEmits<{
    setScore: [score: number]
    setRunouts: [score: number]
}>()

const flyerStore = useFlyerStore()

const score = ref(props.score)
const runouts = ref(props.runouts)

watch(props, () => {
    score.value = props.score
    runouts.value = props.runouts
})
</script>

<template>
    <div class="flex flex-column align-items-center">
        <div class="font-bold">
            {{ flyerStore.getPlayerName(props.playerId) }}
        </div>

        <div v-if="props.finished" class="text-4xl font-bold">
            {{ score }}
        </div>

        <InputNumber v-else
            showButtons
            inputClass="w-4rem text-2xl font-bold py-1"
            buttonLayout="vertical"
            :modelValue="score"
            :min="0" :max="flyerStore.settings.raceTo"
            @update:modelValue="v => emit('setScore', v)">
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
            {{ runouts }}
        </div>

        <InputNumber v-else
            class="runout-stepper"
            showButtons
            inputClass="w-2rem px-1 text-center"
            buttonLayout="horizontal"
            :modelValue="runouts"
            :min="0" :max="flyerStore.settings.raceTo"
            @update:modelValue="v => emit('setRunouts', v)">
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
