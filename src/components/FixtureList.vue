<script setup lang="ts">
import { computed, ref } from "vue"

import FixtureCard from "./FixtureCard.vue"
import RecordResultModal from "./RecordResultModal.vue"

import type { Round } from "../data/RoundRobinScheduler"

import type { Player } from "../models/Player"
import type { Result } from "../models/Result"

const props = defineProps<{
    players: Player[]
    raceTo: number
    currentRound: number
    rounds: Round[]
}>()

const emit = defineEmits<{
    start: [resultId: string]
    updateResult: [result: Result, finish: boolean]
}>()

const selectedResult = ref<Result>()
const showModal = ref(false)

const resultsRemaining = computed(() => props.rounds.flatMap(r => r.fixtures).filter(f => !f.finishTime).length)
const round = computed(() => props.rounds.find(r => r.fixtures.some(f => f.id === selectedResult.value?.id)))

// TODO: fix bug where clicking on a fixture's score, closing the modal via the
// 'X' button, then clicking on the same fixture's score doesn't cause the
// modal to open...
const selectForRecording = (r: Result) => {
    selectedResult.value = r
    showModal.value = true
}

const startFixture = () => {
    if (selectedResult.value) {
        emit('start', selectedResult.value.id)
        hideModal()
    }
}

const updateResult = (result: Result, finish: boolean) => {
    emit('updateResult', result, finish)
    hideModal()
}

const hideModal = () => {
    showModal.value = false
}
</script>

<template>
    <div class="flex flex-column md:flex-row justify-content-between md:align-items-end border-bottom-1 pb-1">
        <h1>Fixtures</h1>

        <h4>Results remaining: {{ resultsRemaining }}</h4>
    </div>

    <div v-for="r, i in props.rounds" :class="[i > 0 && 'border border-top-1']">
        <h3 class="text-center">{{ r.name }}</h3>

        <div v-for="f, j in r.fixtures" class="mt-1 pt-1 mb-1" :class="[j > 0 && 'border-gray-200 border-top-1']">
            <FixtureCard
                :players="props.players"
                :result="f"
                @showResultModal="() => selectForRecording(f)" />
        </div>
    </div>

    <RecordResultModal
        v-if="round && selectedResult"
        :visible="showModal"
        :players="props.players"
        :currentRound="props.currentRound"
        :round="round"
        :result="selectedResult"
        :raceTo="props.raceTo"
        @start="startFixture"
        @confirm="updateResult"
        @cancel="hideModal" />
</template>
