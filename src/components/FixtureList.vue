<script setup lang="ts">
import { computed, ref } from "vue"

import FixtureCard from "./FixtureCard.vue"
import RecordResultModal from "./RecordResultModal.vue"

import type { Player } from "../models/Player"
import type { Result } from "../models/Result"

const props = defineProps<{
    players: Player[]
    raceTo: number
    results: Result[]
}>()

const emit = defineEmits<{
    updateResult: [result: Result]
}>()

const selectedResult = ref<Result>()
const showModal = ref(false)

const resultsRemaining = computed(() => props.results.filter(r => !r.startTime).length)

const selectForRecording = (r: Result) => {
    selectedResult.value = r
    showModal.value = true
}

const updateResult = (result: Result) => {
    emit('updateResult', result)
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

    <div>
        <div v-for="r in props.results" class="mt-1 pb-1 border-gray-200 border-bottom-1 mb-1">
            <FixtureCard
                :players="props.players"
                :result="r"
                @showResultModal="() => selectForRecording(r)" />
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
