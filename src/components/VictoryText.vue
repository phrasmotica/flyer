<script setup lang="ts">
import { computed, watch } from "vue"
import { useSorted } from "@vueuse/core"

import { useFixture } from "../composables/useFixture"
import { useFlyer } from "../composables/useFlyer"
import { usePhase } from "../composables/usePhase"
import { usePodium } from "../composables/usePodium"

import type { Fixture } from "../data/Fixture"

import { useFlyerStore } from "../stores/flyer"

const props = defineProps<{
    fixture: Fixture
}>()

const flyerStore = useFlyerStore()

const {
    mainPhase,
} = useFlyer(flyerStore.flyer)

const {
    settings,
    getRound,
    getPlayerName,
} = usePhase(mainPhase.value)

const {
    winner,
} = usePodium(mainPhase.value)

const {
    fixture,
    scores,
    isWalkover,
    getOpponent,
} = useFixture("victoryText", props.fixture, getRound(props.fixture.id), settings.value)

watch(props, () => {
    fixture.value = props.fixture
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
    if (fixture.value) {
        return getRound(fixture.value.id)?.name || "UNKNOWN"
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
