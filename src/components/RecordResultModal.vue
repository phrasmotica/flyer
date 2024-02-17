<script setup lang="ts">
import { ref } from "vue"

import type { Result } from "../models/Result"

const props = defineProps<{
    visible: boolean
    players: string[]
}>()

const emit = defineEmits<{
    cancel: []
    confirm: [result: Result]
}>()

const DEFAULT_SCORES = props.players.map((_, i) => i === 0 ? 1 : 0)

const scores = ref<number[]>(DEFAULT_SCORES)

const setScore = (index: number, score: number) => {
    scores.value = scores.value.map((s, i) => i === index ? score : s)
}

const confirmResult = () => {
    const result = <Result>{
        scores: props.players.map((p, i) => ({
            player: p,
            score: scores.value[i],
        }))
    }

    emit('confirm', result)

    scores.value = DEFAULT_SCORES
}
</script>

<template>
    <Dialog v-model:visible="props.visible" modal header="Record Result">
        <div v-for="p, i in props.players" class="flex align-items-center justify-content-between mb-2">
            <div class="font-bold">
                {{ p }}
            </div>

            <div class="ml-3">
                <InputNumber
                    showButtons
                    buttonLayout="horizontal"
                    :modelValue="scores[i]"
                    :min="0" :max="3"
                    @update:modelValue="v => setScore(i, v)">
                    <template #incrementbuttonicon>
                        <span class="pi pi-plus" />
                    </template>
                    <template #decrementbuttonicon>
                        <span class="pi pi-minus" />
                    </template>
                </InputNumber>
            </div>
        </div>

        <div class="flex justify-content-end gap-2">
            <Button type="button" label="Cancel" severity="secondary" @click="emit('cancel')"></Button>
            <Button type="button" label="Save" @click="confirmResult"></Button>
        </div>
    </Dialog>
</template>
