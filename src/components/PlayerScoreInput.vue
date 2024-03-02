<script setup lang="ts">
import { ref, watch } from "vue"

import { useFlyerStore } from "../stores/flyer"

const props = defineProps<{
    playerId: string
    score: number
}>()

const emit = defineEmits<{
    setScore: [score: number]
}>()

const flyerStore = useFlyerStore()

const score = ref(props.score)

watch(props, () => {
    score.value = props.score
})
</script>

<template>
    <div class="flex flex-column align-items-center">
        <div class="font-bold">
            {{ flyerStore.getPlayerName(props.playerId) }}
        </div>

        <InputNumber
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
    </div>
</template>
