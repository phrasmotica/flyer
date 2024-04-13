<script setup lang="ts">
import { computed, onMounted, ref, watch } from "vue"
import { useI18n } from "vue-i18n"

import CommentBox from "./CommentBox.vue"
import CommentMessage from "./CommentMessage.vue"
import PlayerScoreInput from "./PlayerScoreInput.vue"
import PlayerWinInput from "./PlayerWinInput.vue"

import { useFixture } from "@/composables/useFixture"
import { useFixtureSwaps } from "@/composables/useFixtureSwaps"
import { useFlyer } from "@/composables/useFlyer"
import { usePhaseSettings } from "@/composables/usePhaseSettings"
import { useRounds } from "@/composables/useRounds"
import { useTweaks } from "@/composables/useTweaks"

import type { Fixture, Score } from "@/data/Fixture"

import { useFlyerStore } from "@/stores/flyer"

const { t } = useI18n()

const props = defineProps<{
    fixture: Fixture
}>()

const emit = defineEmits<{
    hide: []
}>()

const flyerStore = useFlyerStore()

const {
    currentPhase,
} = useFlyer(flyerStore.flyer)

const {
    getRound,
} = useRounds(currentPhase.value)

const {
    processSwap,
} = useFixtureSwaps(currentPhase.value)

const {
    isWinnerStaysOn,
} = usePhaseSettings(currentPhase.value)

const {
    fixture,
    scores,
    runouts,
    comment,
    players,
    canBeFinished,
    hasFinished,
    setWinner,
    setRanOut,
} = useFixture("modal", props.fixture, getRound(props.fixture?.id || ""), currentPhase.value)

const { blurActive } = useTweaks()

const initialScores = ref(scores.value)
const initialRunouts = ref(runouts.value)
const initialComment = ref(comment.value)

// hack to stop InputNumber elements from focusing after pressing their buttons.
// Important for mobile UX
watch([scores, runouts], () => {
    blurActive()
})

const winner = computed(() => {
    const maxScore = scores.value.reduce((a, b) => Math.max(a, b), -1)

    if (maxScore > 0 && scores.value.filter(a => a === maxScore).length === 1) {
        const playerIndex = scores.value.findIndex(a => a === maxScore)
        return players.value[playerIndex]
    }

    return ""
})

const ranOut = computed(() => {
    const maxRunouts = runouts.value.reduce((a, b) => Math.max(a, b), -1)

    if (maxRunouts > 0 && runouts.value.filter(a => a === maxRunouts).length === 1) {
        const playerIndex = runouts.value.findIndex(a => a === maxRunouts)
        return players.value[playerIndex]
    }

    return ""
})

const updateScores = (finish: boolean) => {
    if (!fixture.value || !currentPhase.value) {
        return
    }

    flyerStore.updateComment(currentPhase.value, fixture.value.id, comment.value)

    const newScores = players.value.map<Score>((id, i) => ({
        playerId: id,
        score: scores.value[i],
        runouts: runouts.value[i],
        isBye: false,
    }))

    flyerStore.updateScores(currentPhase.value, fixture.value.id, newScores, finish)

    processSwap()

    hide()
}

const hide = () => {
    resetPlayerScores()

    emit('hide')
}

const resetPlayerScores = () => {
    if (!hasFinished.value) {
        scores.value = initialScores.value
        runouts.value = initialRunouts.value
        comment.value = initialComment.value
    }
}

onMounted(() => {
    initialScores.value = fixture.value?.scores.map(f => f.score) || []
    initialRunouts.value = fixture.value?.scores.map(f => f.runouts) || []
    initialComment.value = fixture.value?.comment || ""
})
</script>

<template>
    <div>
        <div class="grid m-0">
            <PlayerWinInput v-if="isWinnerStaysOn"
                v-for="p, i in players"
                class="col-6"
                :fixture="fixture!"
                :playerId="p"
                :winner="winner"
                :ranOut="ranOut"
                :finished="hasFinished"
                @setWinner="() => setWinner(i, true)"
                @setRanOut="() => setRanOut(i)" />

            <PlayerScoreInput v-else
                v-for="p, i in players"
                class="col-6"
                :fixture="fixture!"
                :playerId="p"
                v-model:score="scores[i]"
                v-model:runouts="runouts[i]"
                :isWinner="winner === p"
                :finished="hasFinished" />
        </div>

        <div id="comment-box-wrapper" class="mt-2">
            <CommentBox v-if="!hasFinished" v-model="comment" />
            <CommentMessage v-else-if="comment" :comment="comment" />
        </div>

        <div class="p-fluid">
            <div class="grid m-0">
                <!-- MEDIUM: this close button doesn't really belong here. It
                just so happens that we're only using this component inside the
                fixture modal -->
                <div class="col-6 p-0 pr-1">
                    <Button
                        type="button"
                        :label="t('common.close')"
                        severity="secondary"
                        @click="hide" />
                </div>

                <div class="col-6 p-0 pl-1">
                    <SplitButton v-if="canBeFinished"
                        :label="t('common.finish')"
                        :model="[
                            {
                                label: t('common.update'),
                                command: () => updateScores(false),
                            },
                        ]"
                        @click="() => updateScores(true)" />

                    <Button v-else
                        type="button"
                        :label="t('common.update')"
                        severity="info"
                        @click="() => updateScores(false)" />
                </div>
            </div>
        </div>
    </div>
</template>
