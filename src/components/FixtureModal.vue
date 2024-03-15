<script setup lang="ts">
import { computed, ref, watch } from "vue"

import Clock from "./Clock.vue"
import PlayerScoreInput from "./PlayerScoreInput.vue"
import PlayerWinInput from "./PlayerWinInput.vue"

import { useFixture } from "../composables/useFixture"
import { useFlyer } from "../composables/useFlyer"
import { useSettings } from "../composables/useSettings"
import { useTweaks } from "../composables/useTweaks"

import type { Fixture, Score } from "../data/Fixture"

import { useFlyerStore, usePlayOffStore } from "../stores/flyer"

const props = defineProps<{
    visible: boolean
    fixture: Fixture | undefined
    isPlayOff?: boolean
}>()

const emit = defineEmits<{
    hide: []
}>()

const defaultFlyerStore = useFlyerStore()
const playOffStore = usePlayOffStore()

const flyerStore = props.isPlayOff ? playOffStore : defaultFlyerStore

const {
    settings,
    currentRound,
    isBusy,
    nextFreeTable,
    getPlayerName,
    getTableName,
    getRound,
} = useFlyer(flyerStore.flyer)

const {
    fixture,
    scores,
    runouts,
    comment,
    players,
    isDraw,
    elapsedSeconds,
    hasStarted,
    hasFinished,
    isInProgress,
    durationSeconds,
    setScore,
    setRunouts,
    setWinner,
    setRanOut,
    resumeClock,
} = useFixture("modal", props.fixture, settings.value)

const {
    isWinnerStaysOn,
} = useSettings(settings.value)

const { blurActive } = useTweaks()

const visible = ref(props.visible)

const initialScores = ref(scores.value)
const initialRunouts = ref(runouts.value)
const initialComment = ref(comment.value)

watch(props, () => {
    visible.value = props.visible
    fixture.value = props.fixture

    setInitialPlayerScores(props.fixture)

    if (props.visible) {
        resumeClock()
    }
})

const round = computed(() => getRound(fixture.value?.id || ""))

// hack to stop InputNumber elements from focusing after pressing their buttons.
// Important for mobile UX
watch([scores, runouts], () => {
    blurActive()
})

const startFixture = () => {
    if (!fixture.value || !nextFreeTable.value) {
        return
    }

    flyerStore.startFixture(fixture.value.id, nextFreeTable.value.id)

    resumeClock()
}

const updateScores = (finish: boolean) => {
    if (!fixture.value) {
        return
    }

    flyerStore.updateComment(fixture.value.id, comment.value)

    const newScores = players.value.map((id, i) => <Score>{
        playerId: id,
        score: scores.value[i],
        runouts: runouts.value[i],
        isBye: false,
    })

    flyerStore.updateScores(fixture.value.id, newScores, finish)

    hide()
}

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

const startButtonText = computed(() => {
    if (!fixture.value) {
        return "???"
    }

    if (fixture.value.scores.some(s => !s.playerId)) {
        if (settings.value.randomlyDrawAllRounds) {
            return "Waiting for round to be generated"
        }

        return "Waiting for a previous result"
    }

    if (fixture.value.scores.some(s => isBusy(s.playerId))) {
        return "Waiting for players to be free"
    }

    if (settings.value.requireCompletedRounds && (round.value?.index || -1) > currentRound.value.index) {
        return "Waiting for round to start"
    }

    if (!nextFreeTable.value) {
        return "Waiting for a free table"
    }

    return "Start on " + nextFreeTable.value.name
})

const disableStart = computed(() => {
    if (!fixture.value) {
        return true
    }

    if (fixture.value.scores.some(s => !s.playerId)) {
        return true
    }

    if (fixture.value.scores.some(s => isBusy(s.playerId))) {
        return true
    }

    if (settings.value.requireCompletedRounds && (round.value?.index || -1) > currentRound.value.index) {
        return true
    }

    return !nextFreeTable.value
})

const disableFinish = computed(() => {
    if (scores.value.every(s => s < settings.value.raceTo)) {
        return true
    }

    if (scores.value.reduce((a, b) => a + b) > 2 * settings.value.raceTo - 1) {
        return true
    }

    if (!settings.value.allowDraws && isDraw.value) {
        return true
    }

    return false
})

const description = computed(() => {
    if (!fixture.value) {
        return "???"
    }

    return fixture.value.scores.map(s => {
        if (s.isBye) {
            return "(bye)"
        }

        return getPlayerName(s.playerId)
    }).join(" v ")
})

const header = computed(() => `${round.value?.name || "???"} - ${description.value}`)

const hide = () => {
    resetPlayerScores()

    emit('hide')
}

const setInitialPlayerScores = (fixture: Fixture | undefined) => {
    initialScores.value = fixture?.scores.map(f => f.score) || []
    initialRunouts.value = fixture?.scores.map(f => f.runouts) || []
    initialComment.value = fixture?.comment || ""
}

const resetPlayerScores = () => {
    scores.value = initialScores.value
    runouts.value = initialRunouts.value
    comment.value = initialComment.value
}
</script>

<template>
    <Dialog
        v-if="fixture"
        modal
        class="mx-4"
        v-model:visible="visible"
        :header="header"
        @hide="hide">
        <div v-if="hasStarted" id="score-inputs" class="mb-2">
            <div class="mb-2">
                <p v-if="fixture.tableId" class="m-0 text-center text-sm">
                    {{ getTableName(fixture.tableId) }}
                </p>

                <Clock :elapsedSeconds="durationSeconds || elapsedSeconds" />
            </div>

            <div class="grid m-0">
                <PlayerWinInput v-if="isWinnerStaysOn"
                    v-for="p, i in players"
                    class="col-6"
                    :fixture="fixture"
                    :playerId="p"
                    :winner="winner"
                    :ranOut="ranOut"
                    :finished="hasFinished"
                    @setWinner="() => setWinner(i, true)"
                    @setRanOut="() => setRanOut(i)" />

                <PlayerScoreInput v-else
                    v-for="p, i in players"
                    class="col-6"
                    :fixture="fixture"
                    :playerId="p"
                    :score="scores[i]"
                    :runouts="runouts[i]"
                    :isWinner="winner === p"
                    :finished="hasFinished"
                    @setScore="v => setScore(v, i)"
                    @setRunouts="v => setRunouts(v, i)" />
            </div>

            <div v-if="!hasFinished" class="flex p-fluid mt-2">
                <Textarea
                    class="text-xs md:text-sm"
                    rows="3"
                    placeholder="Add a comment..."
                    v-model="comment" />
            </div>

            <div v-else-if="comment" class="flex p-fluid pt-1 border-top-1 border-none border-dashed border-gray-200">
                <p class="m-0 text-xs md:text-sm">
                    {{ comment }}
                </p>
            </div>
        </div>

        <div class="p-fluid">
            <Button v-if="!hasStarted"
                class="mb-2"
                type="button"
                :label="startButtonText"
                :disabled="disableStart"
                @click="startFixture" />

            <div v-if="isInProgress" class="flex gap-2 mb-2">
                <Button
                    type="button"
                    label="Update"
                    severity="info"
                    @click="() => updateScores(false)" />

                <Button
                    type="button"
                    label="Finish"
                    :disabled="disableFinish"
                    @click="() => updateScores(true)" />
            </div>

            <Button
                type="button"
                label="Close"
                severity="secondary"
                @click="hide" />
        </div>
    </Dialog>
</template>
