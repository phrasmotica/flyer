<script setup lang="ts">
import { ref } from "vue"

import FixtureCard from "./FixtureCard.vue"
import RecordResultModal from "./RecordResultModal.vue"
import RoundSection from "./RoundSection.vue"

import { RoundStatus, useFlyer } from "../composables/useFlyer"

import type { Result } from "../data/Result"
import type { Round } from "../data/Round"

import { useFlyerStore, usePlayOffStore } from "../stores/flyer"

const props = defineProps<{
    isPlayOff?: boolean
}>()

const defaultFlyerStore = useFlyerStore()
const playOffStore = usePlayOffStore()

const flyerStore = props.isPlayOff ? playOffStore : defaultFlyerStore

const {
    getRoundStatus,
} = useFlyer(flyerStore.flyer)

const selectedResult = ref<Result>()
const highlightedResultId = ref("")
const showModal = ref(false)

const selectForRecording = (r: Result) => {
    selectedResult.value = r
    showModal.value = true
}

const shouldCollapse = (round: Round) => {
    const status = getRoundStatus(round.index)
    return [RoundStatus.Waiting, RoundStatus.Finished].includes(status)
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
    <div v-for="r in flyerStore.rounds" class="my-1 px-2 border-1 border-round-md">
        <RoundSection :name="r.name" :roundIndex="r.index" :hidden="shouldCollapse(r)" :isPlayOff="props.isPlayOff">
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
        :isPlayOff="props.isPlayOff"
        @hide="hideModal" />
</template>
