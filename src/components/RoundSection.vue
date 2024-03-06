<script setup lang="ts">
import { ref } from "vue"

import FixtureCard from "./FixtureCard.vue"

import { RoundStatus, useRound } from "../composables/useRound"

import type { Result } from "../data/Result"
import type { Round } from "../data/Round"

const props = defineProps<{
    round: Round
    highlightedResultId: string
}>()

const emit = defineEmits<{
    showResultModal: [result: Result]
    highlight: [resultId: string]
}>()

const {
    name,
    fixtures,
    status,
} = useRound(props.round)

const showContent = ref([RoundStatus.Ready, RoundStatus.InProgress].includes(status.value))

const toggle = () => {
    // LOW: don't allow showing content if the round is waiting for a
    // previous one to be completed
    showContent.value = !showContent.value
}
</script>

<template>
    <div
        class="flex align-items-baseline justify-content-between cursor-pointer"
        :class="[showContent && 'border-bottom-1']"
        @click="toggle">
        <h3 class="font-bold">{{ name }}</h3>

        <div>
            <i v-if="status === RoundStatus.Waiting" class="pi pi-question-circle ml-2" />
            <i v-if="status === RoundStatus.Ready" class="pi pi-clock ml-2" />
            <i v-if="status === RoundStatus.InProgress" class="pi pi-spin pi-spinner ml-2" />
            <i v-if="status === RoundStatus.Finished" class="pi pi-check-circle ml-2" />
        </div>
    </div>

    <div v-if="showContent">
        <div v-for="f, i in fixtures" class="py-1" :class="[i > 0 && 'border-gray-200 border-top-1']">
            <FixtureCard
                :result="f"
                :highlightedResultId="props.highlightedResultId"
                @showResultModal="emit('showResultModal', f)"
                @highlight="emit('highlight', f.id)" />
        </div>
    </div>
</template>
