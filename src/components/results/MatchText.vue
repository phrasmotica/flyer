<script setup lang="ts">
import { useSorted } from "@vueuse/core"
import { computed, watch } from "vue"
import { useI18n } from "vue-i18n"

import { useFixture } from "@/composables/useFixture"
import { useFlyer } from "@/composables/useFlyer"
import { usePlayers } from "@/composables/usePlayers"
import { useRounds } from "@/composables/useRounds"

import type { Fixture } from "@/data/Fixture"

import { useFlyerStore } from "@/stores/flyer"

const { t } = useI18n()

const props = defineProps<{
    phaseId: string
    fixture: Fixture
    playerId: string
}>()

const flyerStore = useFlyerStore()

const {
    getPhase,
} = useFlyer(flyerStore.flyer)

const {
    getRound,
} = useRounds(getPhase(props.phaseId))

const {
    getPlayerName,
} = usePlayers(getPhase(props.phaseId))

const {
    fixture,
    isWalkover,
} = useFixture("matchText", props.fixture, getRound(props.fixture.id), getPhase(props.phaseId))

watch(props, () => {
    fixture.value = props.fixture
})

const sortedScores = useSorted(fixture.value?.scores || [], (s, t) => {
    if (s.playerId === props.playerId) {
        return -1
    }

    if (t.playerId === props.playerId) {
        return 1
    }

    return 0
})

const scoreText = computed(() => {
    if (isWalkover.value) {
        return t('podium.walkover')
    }

    return sortedScores.value.map(s => s.score).join(t('podium.scoreJoiner'))
})

const opponentName = computed(() => {
    const firstOtherScore = sortedScores.value.find(s => s.playerId !== props.playerId)!
    return getPlayerName(firstOtherScore.playerId)
})

const roundName = computed(() => {
    if (fixture.value) {
        return getRound(fixture.value.id)?.name || t('round.unknownIndicator')
    }

    return t('round.unknownIndicator')
})

const lineClass = computed(() => fixture.value?.isExcluded ? "line-through" : "")
</script>

<template>
    <span>
        <span :class="[
            'font-bold',
            lineClass,
        ]">{{ scoreText }}</span>

        <span v-if="!isWalkover" :class="lineClass">{{ t('podium.opponentFormat', {
            name: opponentName,
        }) }}</span>

        <span :class="[
            'font-italic',
            lineClass,
        ]">{{ t('podium.roundFormat', {
            name: roundName,
        }) }}</span>

        <span v-if="fixture?.isExcluded" class="font-bold">{{ t('podium.excluded') }}</span>
    </span>
</template>
