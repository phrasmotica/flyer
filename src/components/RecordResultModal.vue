<script setup lang="ts">
import { computed, ref, watch } from "vue"

import type { Round } from "../data/RoundRobinScheduler"

import type { Player } from "../models/Player"
import type { Result } from "../models/Result"

const props = defineProps<{
    visible: boolean
    players: Player[]
    round: Round
    result: Result
    raceTo: number
}>()

const emit = defineEmits<{
    cancel: []
    start: []
    confirm: [result: Result, finish: boolean]
}>()

const visible = ref(props.visible)
const selectedPlayers = ref(props.result.scores.map(r => r.playerId))
const scores = ref(props.result.scores.map(r => r.score))

// hack to stop InputNumber elements from focusing after pressing their buttons.
// Important for mobile UX
watch([scores], () => {
    (<any>document.activeElement)?.blur()
})

watch(props, () => {
    visible.value = props.visible
    selectedPlayers.value = props.result.scores.map(r => r.playerId)
    scores.value = props.result.scores.map(r => r.score)
})

const playerOptions = computed(() => props.players)

const setPlayer = (index: number, newId: string) => {
    selectedPlayers.value = selectedPlayers.value.map((id, i) => i === index ? newId : id)
}

const setScore = (index: number, score: number) => {
    scores.value = scores.value.map((s, i) => i === index ? score : s)
}

const startFixture = () => emit('start')

const updateResult = (finish: boolean) => {
    const result = <Result>{
        id: props.result.id,
        scores: selectedPlayers.value.map((id, i) => ({
            playerId: id,
            score: scores.value[i],
        })),
        startTime: props.result.startTime,
    }

    emit('confirm', result, finish)
}

const disableStart = computed(() => false)

const disableFinish = computed(() => {
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

const getPlayerName = (id: string) => props.players.find(p => p.id === id)?.name

const description = computed(() => props.result.scores.map(s => getPlayerName(s.playerId)!).join(" v "))

const header = computed(() => `${props.round.name} - ${description.value}`)
</script>

<template>
    <Dialog v-model:visible="visible" modal :header="header">
        <div v-if="props.result.finishTime" v-for="id, i in selectedPlayers" class="flex flex-column md:flex-row md:align-items-center justify-content-between mb-2">
            <div class="font-bold">
                {{ getPlayerName(id) }}: {{ scores[i] }}
            </div>
        </div>

        <div v-else-if="props.result.startTime" v-for="id, i in selectedPlayers" class="flex flex-column md:flex-row md:align-items-center justify-content-between mb-2">
            <div class="font-bold">
                {{ getPlayerName(id) }}
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

        <div class="p-fluid">
            <div class="p-buttonset">
                <Button type="button" label="Close" severity="secondary" @click="emit('cancel')"></Button>
                <Button v-if="!props.result.startTime" type="button" label="Start" :disabled="disableStart" @click="startFixture"></Button>
                <Button v-if="props.result.startTime" type="button" label="Update" severity="info" @click="() => updateResult(false)"></Button>
                <Button v-if="props.result.startTime" type="button" label="Finish" :disabled="disableFinish" @click="() => updateResult(true)"></Button>
            </div>
        </div>
    </Dialog>
</template>
