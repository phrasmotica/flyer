<script setup lang="ts">
import { computed, onUnmounted, ref, watch } from "vue"

import Clock from "./Clock.vue"
import PlayerScoreInput from "./PlayerScoreInput.vue"

import { useFlyer } from "../composables/useFlyer"
import { useMatch } from "../composables/useMatch"
import { useTweaks } from "../composables/useTweaks"

import type { Result, Score } from "../data/Result"

import { useFlyerStore } from "../stores/flyer"

const props = defineProps<{
    visible: boolean
    result: Result
}>()

const emit = defineEmits<{
    hide: []
}>()

const flyerStore = useFlyerStore()

const { isBusy } = useFlyer(flyerStore.flyer)

const {
    result,
    scores,
    players,
    elapsedSeconds,
    hasStarted,
    hasFinished,
    isInProgress,
    durationSeconds,
    setScore,
    pauseClock,
    resumeClock,
} = useMatch("modal", props.result)

const { blurActive } = useTweaks()

const visible = ref(props.visible)

watch(props, () => {
    visible.value = props.visible
    result.value = props.result
})

const round = computed(() => flyerStore.getRound(result.value.id)!)

// hack to stop InputNumber elements from focusing after pressing their buttons.
// Important for mobile UX
watch([scores], () => {
    blurActive()
})

const startFixture = () => {
    flyerStore.startFixture(result.value.id)

    resumeClock()
}

const updateScores = (finish: boolean) => {
    const newScores = players.value.map((id, i) => <Score>{
        playerId: id,
        score: scores.value[i],
        isBye: false,
    })

    flyerStore.updateScores(result.value.id, newScores, finish)

    hide()
}

const startButtonText = computed(() => {
    if (result.value.scores.some(s => !s.playerId)) {
        if (flyerStore.settings.randomlyDrawAllRounds) {
            return "Waiting for round to be generated"
        }

        return "Waiting for a previous result"
    }

    if (result.value.scores.some(s => isBusy(s.playerId))) {
        return "Waiting for players to be free"
    }

    if (flyerStore.settings.requireCompletedRounds && round.value.index > flyerStore.currentRound) {
        return "Waiting for round to start"
    }

    if (flyerStore.ongoingCount >= flyerStore.settings.tableCount) {
        return "Waiting for a free table"
    }

    return "Start"
})

const disableStart = computed(() => {
    if (result.value.scores.some(s => !s.playerId)) {
        return true
    }

    if (result.value.scores.some(s => isBusy(s.playerId))) {
        return true
    }

    if (flyerStore.settings.requireCompletedRounds && round.value.index > flyerStore.currentRound) {
        return true
    }

    return flyerStore.ongoingCount >= flyerStore.settings.tableCount
})

const disableFinish = computed(() => {
    if (scores.value.every(s => s < flyerStore.settings.raceTo)) {
        return true
    }

    if (scores.value.reduce((a, b) => a + b) > 2 * flyerStore.settings.raceTo - 1) {
        return true
    }

    if (!flyerStore.settings.allowDraws && [...new Set(scores.value)].length <= 1) {
        return true
    }

    return false
})

const description = computed(() => result.value.scores.map(s => {
    if (s.isBye) {
        return "(bye)"
    }

    return flyerStore.getPlayerName(s.playerId) || "???"
}).join(" v "))

const header = computed(() => `${round.value.name} - ${description.value}`)

const hide = () => {
    emit('hide')
}

onUnmounted(() => {
    pauseClock()
})
</script>

<template>
    <Dialog
        modal
        class="mx-4"
        v-model:visible="visible"
        :header="header"
        @hide="hide">
        <div v-if="hasStarted" id="score-inputs" class="mb-2">
            <div class="mb-2">
                <Clock :elapsedSeconds="durationSeconds || elapsedSeconds" />
            </div>

            <div class="grid m-0">
                <PlayerScoreInput
                    v-for="p, i in players"
                    class="col-6"
                    :playerId="p"
                    :score="scores[i]"
                    :runouts="0"
                    :finished="hasFinished"
                    @setScore="v => setScore(i, v)" />
            </div>
        </div>

        <div class="p-fluid">
            <Button v-if="!hasStarted"
                class="mb-2"
                type="button"
                :label="startButtonText"
                :disabled="disableStart"
                @click="startFixture" />

            <Button v-if="isInProgress"
                class="mb-2"
                type="button"
                label="Update"
                severity="info"
                @click="() => updateScores(false)" />

            <Button v-if="isInProgress"
                class="mb-2"
                type="button"
                label="Finish"
                :disabled="disableFinish"
                @click="() => updateScores(true)" />

            <Button
                type="button"
                label="Close"
                severity="secondary"
                @click="hide" />
        </div>
    </Dialog>
</template>
