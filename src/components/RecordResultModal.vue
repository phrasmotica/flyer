<script setup lang="ts">
import { ref } from "vue"

import type { Result } from "../models/Result"

const props = defineProps<{
    players: string[]
}>()

const emit = defineEmits<{
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
    <div class="modal" tabindex="-1">
        <div class="modal-dialog">
            <div class="modal-content">
                <div class="modal-header">
                    <h5 class="modal-title">Record Result</h5>
                    <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                </div>

                <div class="modal-body">
                    <div v-for="p, i in props.players" class="d-flex align-items-center justify-content-between mb-2">
                        <div>
                            {{ p }}
                        </div>

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

                <div class="modal-footer">
                    <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">
                        Cancel
                    </button>

                    <button type="button" class="btn btn-primary" data-bs-dismiss="modal" @click="confirmResult">
                        Confirm
                    </button>
                </div>
            </div>
        </div>
    </div>
</template>
