<script setup lang="ts">
import { computed, ref } from "vue"

import FixtureCard from "./FixtureCard.vue"
import RecordResultModal from "./RecordResultModal.vue"

import type { Result } from "../models/Result"

import { useRoundsStore } from "../stores/rounds"

const props = defineProps<{
    raceTo: number
}>()

const roundsStore = useRoundsStore()
const round = computed(() => roundsStore.getRound(selectedResult.value?.id || ""))

const selectedResult = ref<Result>()
const showModal = ref(false)

const selectForRecording = (r: Result) => {
    selectedResult.value = r
    showModal.value = true
}

const startFixture = () => {
    if (selectedResult.value) {
        roundsStore.startFixture(selectedResult.value.id)
        hideModal()
    }
}

const updateResult = (result: Result, finish: boolean) => {
    roundsStore.updateResult(result, finish)
    hideModal()
}

const hideModal = () => {
    showModal.value = false
}
</script>

<template>
    <div class="flex flex-column md:flex-row justify-content-between md:align-items-end border-bottom-1 pb-1">
        <h1>Fixtures</h1>

        <h4>Results remaining: {{ roundsStore.remainingCount }}</h4>
    </div>

    <div v-for="r, i in roundsStore.rounds" :class="[i > 0 && 'border border-top-1']">
        <h3 class="text-center">{{ r.name }}</h3>

        <div v-for="f, j in r.fixtures" class="mt-1 pt-1 mb-1" :class="[j > 0 && 'border-gray-200 border-top-1']">
            <FixtureCard
                :result="f"
                @showResultModal="() => selectForRecording(f)" />
        </div>
    </div>

    <RecordResultModal
        v-if="round && selectedResult"
        :visible="showModal"
        :round="round"
        :result="selectedResult"
        :raceTo="props.raceTo"
        @start="startFixture"
        @confirm="updateResult"
        @cancel="hideModal" />
</template>
