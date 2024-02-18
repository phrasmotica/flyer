<script setup lang="ts">
import { v4 as uuidv4 } from "uuid"
import { computed, ref, watch } from "vue"

import PlayerDropdown from "./PlayerDropdown.vue"

import type { Player } from "../models/Player"
import type { Result } from "../models/Result"

const props = defineProps<{
    visible: boolean
    players: Player[]
    selected: Player[]
    results: Result[]
    raceTo: number
}>()

const emit = defineEmits<{
    cancel: []
    confirm: [result: Result]
}>()

const DEFAULT_SCORES = props.players.map((_, i) => i === 0 ? 1 : 0)

const selectedPlayers = ref(props.selected.map(p => p.id))
const scores = ref<number[]>(DEFAULT_SCORES)

// hack to stop InputNumber elements from focusing after pressing their buttons.
// Important for mobile UX
watch([scores], () => {
    (<any>document.activeElement)?.blur()
})

watch(props, () => {
    selectedPlayers.value = props.selected.map(p => p.id)
})

const playerOptions = computed(() => props.players)

const setPlayer = (index: number, newId: string) => {
    selectedPlayers.value = selectedPlayers.value.map((id, i) => i === index ? newId : id)
}

const setScore = (index: number, score: number) => {
    scores.value = scores.value.map((s, i) => i === index ? score : s)
}

const confirmResult = () => {
    const result = <Result>{
        id: uuidv4(),
        scores: selectedPlayers.value.map((id, i) => ({
            playerId: id,
            score: scores.value[i],
        }))
    }

    emit('confirm', result)

    scores.value = DEFAULT_SCORES
}

const disableSubmit = computed(() => {
    const uniquePlayers = [...new Set(selectedPlayers.value)]
    if (uniquePlayers.length !== selectedPlayers.value.length) {
        return true
    }

    if (scores.value.every(s => s < props.raceTo)) {
        return true
    }

    // TODO: prevent submitting a draw, configurable?

    return false
})
</script>

<template>
    <Dialog v-model:visible="props.visible" modal header="Record Result">
        <div v-for="p, i in selectedPlayers" class="flex flex-column md:flex-row md:align-items-center justify-content-between mb-2">
            <div class="font-bold p-fluid mb-2 md:mb-0">
                <PlayerDropdown :players="playerOptions" :selectedPlayerId="p" @select="id => setPlayer(i, id)" />
            </div>

            <div class="md:ml-3">
                <InputNumber
                    showButtons
                    buttonLayout="horizontal"
                    :modelValue="scores[i]"
                    :min="0" :max="props.raceTo"
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
            <Button type="button" label="Save" :disabled="disableSubmit" @click="confirmResult"></Button>
        </div>
    </Dialog>
</template>
