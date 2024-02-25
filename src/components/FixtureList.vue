<script setup lang="ts">
import { onUnmounted, ref } from "vue"

import Clock from "./Clock.vue"
import FixtureCard from "./FixtureCard.vue"
import RecordResultModal from "./RecordResultModal.vue"

import { useClock } from "../composables/useClock"

import type { Result } from "../data/Result"

import { useFlyerStore } from "../stores/flyer"

const flyerStore = useFlyerStore()

const selectedResult = ref<Result>()
const highlightedResultId = ref("")
const showModal = ref(false)

const { elapsedSeconds, interval } = useClock("flyer", flyerStore.flyer.startTime || 0)

const selectForRecording = (r: Result) => {
    selectedResult.value = r
    showModal.value = true
}

const highlight = (resultId: string) => {
    if (highlightedResultId.value === resultId) {
        highlightedResultId.value = ""
    }
    else {
        highlightedResultId.value = resultId
    }
}

const hideModal = () => {
    showModal.value = false
}

onUnmounted(() => {
    interval.pause()
})
</script>

<template>
    <div class="flex flex-column md:flex-row justify-content-between md:align-items-end border-bottom-1 pb-1">
        <h1>{{ flyerStore.settings.name }} - Fixtures</h1>

        <Clock :elapsedSeconds="elapsedSeconds" />
    </div>

    <div v-for="r, i in flyerStore.rounds" :class="[i > 0 && 'border border-top-1']">
        <h3 class="text-center">{{ r.name }}</h3>

        <div v-for="f, j in r.fixtures" class="mt-1 pt-1 mb-1" :class="[j > 0 && 'border-gray-200 border-top-1']">
            <FixtureCard
                :result="f"
                :highlightedResultId="highlightedResultId"
                @showResultModal="() => selectForRecording(f)"
                @highlight="highlight" />
        </div>
    </div>

    <RecordResultModal
        v-if="selectedResult"
        :visible="showModal"
        :result="selectedResult"
        @hide="hideModal" />
</template>
