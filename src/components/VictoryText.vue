<script setup lang="ts">
import { computed, watch } from "vue"

import { useFlyer } from "../composables/useFlyer"
import { useMatch } from "../composables/useMatch"
import { usePodium } from "../composables/usePodium"

import type { Result } from "../data/Result"

import { useFlyerStore } from "../stores/flyer"

const props = defineProps<{
    result: Result
}>()

const flyerStore = useFlyerStore()

const {
    getRound,
    getPlayerName,
} = useFlyer(flyerStore.flyer)

const {
    winner,
} = usePodium(flyerStore.flyer)

const {
    result,
    scores,
    isWalkover,
    getOpponent,
} = useMatch("victoryText", props.result)

watch(props, () => {
    result.value = props.result
})

const score = computed(() => {
    if (isWalkover.value) {
        return "W/O"
    }

    const sortedScores = [...scores.value].sort((a, b) => b - a)
    return sortedScores.join("-")
})

const opponentName = computed(() => getPlayerName(getOpponent(winner.value?.id || "")))

const roundName = computed(() => getRound(result.value.id)?.name || "UNKNOWN")
</script>

<template>
    <span>
        <span class="font-bold">{{ score }}</span>
        <span v-if="!isWalkover">&nbsp;v {{ opponentName }}</span>
        <span class="font-italic">&nbsp;({{ roundName }})</span>
    </span>
</template>
