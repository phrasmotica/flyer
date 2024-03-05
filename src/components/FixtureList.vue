<script setup lang="ts">
import { ref } from "vue"

import RecordResultModal from "./RecordResultModal.vue"
import RoundSection from "./RoundSection.vue"

import { useFlyer } from "../composables/useFlyer"

import type { Result } from "../data/Result"

import { useFlyerStore, usePlayOffStore } from "../stores/flyer"

const props = defineProps<{
    isPlayOff?: boolean
}>()

const defaultFlyerStore = useFlyerStore()
const playOffStore = usePlayOffStore()

const flyerStore = props.isPlayOff ? playOffStore : defaultFlyerStore

const {
    rounds,
} = useFlyer(flyerStore.flyer)

const selectedResult = ref<Result>()
const highlightedResultId = ref("")
const showModal = ref(false)

const selectForRecording = (r: Result) => {
    selectedResult.value = r
    showModal.value = true
}

const highlight = (resultId: string) => {
    // TODO: automatically show the round sections containing the parent
    // fixture of the highlighted player name if it's currently hidden
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
    <div v-for="r in rounds" class="my-1 px-2 border-1 border-round-md">
        <RoundSection
            :round="r"
            :highlightedResultId="highlightedResultId"
            @showResultModal="selectForRecording"
            @highlight="highlight" />
    </div>

    <RecordResultModal
        v-if="selectedResult"
        :visible="showModal"
        :result="selectedResult"
        :isPlayOff="props.isPlayOff"
        @hide="hideModal" />
</template>
