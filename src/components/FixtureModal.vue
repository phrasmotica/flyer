<script setup lang="ts">
import { computed, ref, watch } from "vue"

import Clock from "./Clock.vue"
import PlayerBreakInput from "./PlayerBreakInput.vue"
import PlayerScoreInput from "./PlayerScoreInput.vue"
import PlayerWinInput from "./PlayerWinInput.vue"

import { useFixture } from "../composables/useFixture"
import { useFlyer } from "../composables/useFlyer"
import { FixtureStatus, usePhase } from "../composables/usePhase"
import { useRound } from "../composables/useRound"
import { useSettings } from "../composables/useSettings"
import { useTweaks } from "../composables/useTweaks"

import type { Fixture, Score } from "../data/Fixture"

import { useFlyerStore } from "../stores/flyer"

const props = defineProps<{
    visible: boolean
    fixture: Fixture | undefined
}>()

const emit = defineEmits<{
    hide: []
}>()

const flyerStore = useFlyerStore()

const {
    currentPhase,
} = useFlyer(flyerStore.flyer)

const {
    settings,
    currentRound,
    canStartFixture,
    nextFreeTable,
    getRound,
    getTableName,
    getFixtureStatus,
    getFixtureHeader,
} = usePhase(currentPhase.value)

const {
    status: currentRoundStatus,
} = useRound(currentRound.value, settings.value)

const {
    fixture,
    round,
    breakerId,
    scores,
    runouts,
    comment,
    players,
    elapsedSeconds,
    hasStarted,
    hasFinished,
    isInProgress,
    canBeFinished,
    durationSeconds,
    setWinner,
    setRanOut,
    resumeClock,
} = useFixture("modal", props.fixture, getRound(props.fixture?.id || ""), settings.value)

const {
    isWinnerStaysOn,
} = useSettings(settings.value)

const { blurActive } = useTweaks()

const visible = ref(props.visible)

const initialBreakerId = ref(breakerId.value)
const initialScores = ref(scores.value)
const initialRunouts = ref(runouts.value)
const initialComment = ref(comment.value)

watch(props, () => {
    visible.value = props.visible
    fixture.value = props.fixture

    // LOW: recompute this entirely inside useFixture()
    round.value = getRound(props.fixture?.id || "")

    setInitialPlayerScores(props.fixture)

    if (props.visible) {
        resumeClock()
    }
})

// hack to stop InputNumber elements from focusing after pressing their buttons.
// Important for mobile UX
watch([scores, runouts], () => {
    blurActive()
})

const startFixture = () => {
    if (!fixture.value || !nextFreeTable.value) {
        return
    }

    flyerStore.startFixture(fixture.value.id, nextFreeTable.value.id, breakerId.value)

    resumeClock()
}

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

// BUG: ensure breakerId is reset when the fixture changes
const canStart = computed(() => !!breakerId.value && canStartFixture(fixture.value, currentRoundStatus.value))

const fixtureStatus = computed(() => getFixtureStatus(fixture.value, currentRoundStatus.value))

const startButtonText = computed(() => {
    if (fixtureStatus.value === FixtureStatus.Unknown) {
        return "???"
    }

    if (fixtureStatus.value === FixtureStatus.WaitingForRoundGeneration) {
        return "Waiting for round to be generated"
    }

    if (fixtureStatus.value === FixtureStatus.WaitingForPreviousResult) {
        return "Waiting for a previous result"
    }

    if (fixtureStatus.value === FixtureStatus.WaitingForPlayers) {
        return "Waiting for players to be free"
    }

    if (fixtureStatus.value === FixtureStatus.WaitingForRound) {
        return "Waiting for round to start"
    }

    if (fixtureStatus.value === FixtureStatus.WaitingForTable) {
        return "Waiting for a free table"
    }

    return "Start on " + nextFreeTable.value!.name
})

const hide = () => {
    resetPlayerScores()

    emit('hide')
}

const setInitialPlayerScores = (fixture: Fixture | undefined) => {
    initialBreakerId.value = fixture?.breakerId || ""
    initialScores.value = fixture?.scores.map(f => f.score) || []
    initialRunouts.value = fixture?.scores.map(f => f.runouts) || []
    initialComment.value = fixture?.comment || ""
}

const resetPlayerScores = () => {
    breakerId.value = initialBreakerId.value
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
        :header="getFixtureHeader(fixture)"
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
                    v-model:score="scores[i]"
                    v-model:runouts="runouts[i]"
                    :isWinner="winner === p"
                    :finished="hasFinished" />
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
        <div v-else-if="fixtureStatus === FixtureStatus.ReadyToStart">
            <p class="m-0 text-center">Who will break first?</p>

            <div class="grid m-0">
                <PlayerBreakInput
                    v-for="p in players"
                    class="col-6"
                    :fixture="fixture"
                    :playerId="p"
                    :breakerId="breakerId"
                    @setBreakerId="breakerId = p" />
            </div>
        </div>

        <div class="p-fluid">
            <Button v-if="!hasStarted"
                class="mb-2"
                type="button"
                :label="startButtonText"
                :disabled="!canStart"
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
                    :disabled="!canBeFinished"
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
