<script setup lang="ts">
import { ref } from "vue"

import FixtureCard from "./FixtureCard.vue"
import RecordResultModal from "./RecordResultModal.vue"
import RoundSection from "./RoundSection.vue"

import type { Result } from "../data/Result"

import { useFlyerStore } from "../stores/flyer"

const flyerStore = useFlyerStore()

const selectedResult = ref<Result>()
const highlightedResultId = ref("")
const showModal = ref(false)

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
</script>

<template>
    <div v-for="r in flyerStore.rounds" class="my-1 px-2 border-1 border-round-md">
        <RoundSection :name="r.name">
            <div v-for="f, i in r.fixtures" class="py-1" :class="[i > 0 && 'border-gray-200 border-top-1']">
                <FixtureCard
                    :result="f"
                    :highlightedResultId="highlightedResultId"
                    @showResultModal="() => selectForRecording(f)"
                    @highlight="highlight" />
            </div>
        </RoundSection>
    </div>

    <RecordResultModal
        v-if="selectedResult"
        :visible="showModal"
        :result="selectedResult"
        @hide="hideModal" />
</template>
