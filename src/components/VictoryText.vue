<script setup lang="ts">
import { computed, watch } from "vue"
import { useSorted } from "@vueuse/core"

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

const sortedScores = useSorted(scores, (a, b) => b - a)

const scoreText = computed(() => {
    if (isWalkover.value) {
        return "W/O"
    }

    return sortedScores.value.join("-")
})

const opponentName = computed(() => getPlayerName(getOpponent(winner.value?.id || "")))

const roundName = computed(() => {
    if (result.value) {
        return getRound(result.value.id)?.name || "UNKNOWN"
    }

    return "UNKNOWN"
})
</script>

<template>
    <span>
        <span class="font-bold">{{ scoreText }}</span>
        <span v-if="!isWalkover">&nbsp;v {{ opponentName }}</span>
        <span class="font-italic">&nbsp;({{ roundName }})</span>
    </span>
</template>
