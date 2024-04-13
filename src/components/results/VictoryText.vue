<script setup lang="ts">
import { computed, watch } from "vue"
import { useI18n } from "vue-i18n"
import { useSorted } from "@vueuse/core"

import { useFixture } from "@/composables/useFixture"
import { useFlyer } from "@/composables/useFlyer"
import { usePhase } from "@/composables/usePhase"
import { usePlayers } from "@/composables/usePlayers"
import { usePodium } from "@/composables/usePodium"

import type { Fixture } from "@/data/Fixture"

import { useFlyerStore } from "@/stores/flyer"

const { t } = useI18n()

const props = defineProps<{
    fixture: Fixture
}>()

const flyerStore = useFlyerStore()

const {
    mainPhase,
} = useFlyer(flyerStore.flyer)

const {
    getRound,
} = usePhase(mainPhase.value)

const {
    getPlayerName,
} = usePlayers(mainPhase.value)

const {
    winner,
} = usePodium(mainPhase.value)

const {
    fixture,
    scores,
    isWalkover,
    getOpponent,
} = useFixture("victoryText", props.fixture, getRound(props.fixture.id), mainPhase.value)

watch(props, () => {
    fixture.value = props.fixture
})

const sortedScores = useSorted(scores, (a, b) => b - a)

const scoreText = computed(() => {
    // MEDIUM: use usePhase().getScoreDescription()
    if (isWalkover.value) {
        return t('podium.walkover')
    }

    return sortedScores.value.join(t('podium.scoreJoiner'))
})

const opponentName = computed(() => getPlayerName(getOpponent(winner.value?.id || "")))

const roundName = computed(() => {
    if (fixture.value) {
        return getRound(fixture.value.id)?.name || t('round.unknownIndicator')
    }

    return t('round.unknownIndicator')
})
</script>

<template>
    <span>
        <span class="font-bold">{{ scoreText }}</span>

        <span v-if="!isWalkover">{{ t('podium.opponentFormat', {
            name: opponentName,
        }) }}</span>

        <span class="font-italic">{{ t('podium.roundFormat', {
            name: roundName,
        }) }}</span>
    </span>
</template>
