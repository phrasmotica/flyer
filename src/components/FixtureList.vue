<script setup lang="ts">
import { computed, ref } from "vue"

import FixtureCard from "./FixtureCard.vue"
import RecordResultModal from "./RecordResultModal.vue"

import type { Round } from "../data/Scheduler"

import type { Player } from "../models/Player"
import type { Result } from "../models/Result"

const props = defineProps<{
    players: Player[]
    raceTo: number
    rounds: Round[]
}>()

const emit = defineEmits<{
    updateResult: [result: Result, finish: boolean]
}>()

const selectedResult = ref<Result>()
const showModal = ref(false)

const resultsRemaining = computed(() => props.rounds.flatMap(r => r.fixtures).filter(f => !f.finishTime).length)

const selectForRecording = (r: Result) => {
    selectedResult.value = r
    showModal.value = true
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
        v-if="selectedResult"
        :visible="showModal"
        :players="props.players"
        :result="selectedResult"
        :raceTo="props.raceTo"
        @confirm="updateResult"
        @cancel="hideModal" />
</template>
../data/RoundRobinScheduler
