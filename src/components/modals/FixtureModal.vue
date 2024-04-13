<script setup lang="ts">
import { computed, ref, watch } from "vue"
import { useI18n } from "vue-i18n"

import Clock from "../play/Clock.vue"
import CommentMessage from "../play/CommentMessage.vue"
import LabelledDropdown from "../setup/LabelledDropdown.vue"
import PlayerBreakInput from "../play/PlayerBreakInput.vue"
import PlayerScoreInput from "../play/PlayerScoreInput.vue"
import PlayerWinInput from "../play/PlayerWinInput.vue"
import RaceToBadge from "../play/RaceToBadge.vue"
import TableBadge from "../play/TableBadge.vue"

import { useFixture } from "@/composables/useFixture"
import { useFlyer } from "@/composables/useFlyer"
import { FixtureStatus, usePhase } from "@/composables/usePhase"
import { usePhaseEvents } from "@/composables/usePhaseEvents"
import { usePhaseSettings } from "@/composables/usePhaseSettings"
import { useRound } from "@/composables/useRound"
import { useTweaks } from "@/composables/useTweaks"

import { emptyScores, type Fixture, type Score } from "@/data/Fixture"

import { useFlyerStore } from "@/stores/flyer"

const { t } = useI18n()

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
    freeTables,
    nextFixture,
    nextFreeFixture,
    canStartFixture,
    getRound,
    getRoundWithIndex,
    getTable,
    getFixtureStatus,
    getPlayer,
    getPlayerName,
} = usePhase(currentPhase.value)

const phaseEvents = usePhaseEvents(currentPhase.value)

const {
    status: currentRoundStatus,
} = useRound(currentRound.value, currentPhase.value)

const {
    fixture,
    round,
    breakerId,
    tableId,
    raceTo,
    scores,
    runouts,
    comment,
    players,
    elapsedMilliseconds,
    hasStarted,
    hasFinished,
    isInProgress,
    canBeFinished,
    estimatedDurationMilliseconds,
    durationMilliseconds,
    setWinner,
    setRanOut,
    resumeClock,
} = useFixture("modal", props.fixture, getRound(props.fixture?.id || ""), currentPhase.value)

const {
    isRoundRobin,
    isWinnerStaysOn,
} = usePhaseSettings(settings.value)

const { blurActive } = useTweaks()

const visible = ref(props.visible)

const initialBreakerId = ref(breakerId.value)
const initialTableId = ref(tableId.value)
const initialScores = ref(scores.value)
const initialRunouts = ref(runouts.value)
const initialComment = ref(comment.value)

watch(props, () => {
    visible.value = props.visible
    fixture.value = props.fixture

    // LOW: recompute this entirely inside useFixture()
    round.value = getRound(props.fixture?.id || "")

    tableId.value = freeTables.value[0]?.id || ""

    setInitialPlayerScores(props.fixture)

    if (props.visible && isInProgress.value) {
        resumeClock()
    }
})

// hack to stop InputNumber elements from focusing after pressing their buttons.
// Important for mobile UX
watch([scores, runouts], () => {
    blurActive()
})

const assignTable = () => {
    if (!currentPhase.value || !fixture.value || freeTables.value.length <= 0 || !tableId.value) {
        return
    }

    flyerStore.assignTable(currentPhase.value, fixture.value.id, tableId.value)

    const message = phaseEvents.fixtureAssignedTable(fixture.value, tableId.value)
    flyerStore.addPhaseEvent(currentPhase.value, message)
}

const assignBreaker = () => {
    if (!currentPhase.value || !fixture.value || !breakerId.value) {
        return
    }

    flyerStore.assignBreaker(currentPhase.value, fixture.value.id, breakerId.value)

    const message = phaseEvents.fixtureAssignedBreaker(fixture.value, breakerId.value)
    flyerStore.addPhaseEvent(currentPhase.value, message)
}

const startFixture = () => {
    if (!currentPhase.value || !fixture.value || !table.value || !breaker.value) {
        return
    }

    flyerStore.startFixture(currentPhase.value, fixture.value.id)

    const message = phaseEvents.fixtureStarted(fixture.value)
    flyerStore.addPhaseEvent(currentPhase.value, message)

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

    if (finish) {
        const message = phaseEvents.fixtureFinished(fixture.value)
        flyerStore.addPhaseEvent(currentPhase.value, message)

        if (isRoundRobin.value && nextFixture.value && nextFreeFixture.value) {
            const [roundA, indexA] = getRoundWithIndex(nextFixture.value.id)
            const [roundB, indexB] = getRoundWithIndex(nextFreeFixture.value.id)

            if (roundA && roundB) {
                // generate this now - the computed properties update after the swap...
                const message = phaseEvents.fixturesSwapped(nextFixture.value, nextFreeFixture.value)

                // if necessary, swap the next fixture in the current round (or
                // the first fixture in the next round) with the first upcoming fixture
                // where all players are free
                const didSwap = flyerStore.swapFixtures(currentPhase.value, roundA, indexA, roundB, indexB)
                if (didSwap) {
                    flyerStore.addPhaseEvent(currentPhase.value, message)
                }
            }
        }
    }

    hide()
}

const table = computed(() => getTable(fixture.value?.tableId || ""))
const breaker = computed(() => getPlayer(fixture.value?.breakerId || ""))

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

const freeTablesOptions = computed(() => freeTables.value.map(t => ({
    name: t.name,
    value: t.id,
})))

const canAssignTable = computed(() => !!tableId.value)
const canAssignBreaker = computed(() => !!breakerId.value)

const canStart = computed(() => canStartFixture(fixture.value, currentRoundStatus.value))

const fixtureStatus = computed(() => getFixtureStatus(fixture.value, currentRoundStatus.value))

const startButtonText = computed(() => {
    // MEDIUM: move most of this into a composable?
    if (fixtureStatus.value === FixtureStatus.Unknown) {
        return t('fixture.unknownStatus')
    }

    if (fixtureStatus.value === FixtureStatus.WaitingForRoundGeneration) {
        return t('fixture.waitingForRoundGenerationStatus')
    }

    if (fixtureStatus.value === FixtureStatus.WaitingForPreviousResult) {
        return t('fixture.waitingForPreviousResultStatus')
    }

    if (fixtureStatus.value === FixtureStatus.WaitingForPlayers) {
        return t('fixture.waitingForPlayersStatus')
    }

    if (fixtureStatus.value === FixtureStatus.WaitingForRound) {
        return t('fixture.waitingForRoundStatus')
    }

    if (fixtureStatus.value === FixtureStatus.WaitingForTable) {
        return t('fixture.waitingForTableStatus')
    }

    return t('common.start')
})

const hide = () => {
    resetPlayerScores()

    emit('hide')
}

const setInitialPlayerScores = (fixture: Fixture | undefined) => {
    initialBreakerId.value = fixture?.breakerId || ""
    initialTableId.value = fixture?.tableId || ""
    initialScores.value = fixture?.scores.map(f => f.score) || []
    initialRunouts.value = fixture?.scores.map(f => f.runouts) || []
    initialComment.value = fixture?.comment || ""
}

const resetPlayerScores = () => {
    if (hasFinished.value) {
        breakerId.value = ""
        tableId.value = ""
    }
    else {
        breakerId.value = initialBreakerId.value
        tableId.value = initialTableId.value
        scores.value = initialScores.value
        runouts.value = initialRunouts.value
        comment.value = initialComment.value
    }
}

const getPlayersDescription = (scores: Score[]) => {
    return scores.map(s => {
        if (s.isBye) {
            return t("player.byeIndicator")
        }

        return getPlayerName(s.playerId) || t("player.unknownIndicator")
    }).join(t("fixture.playerJoiner"))
}

const header = computed(() => {
    let round = t("round.unknownIndicator")
    let players = getPlayersDescription(emptyScores(2))

    if (fixture.value) {
        round = getRound(fixture.value.id)?.name || t("round.unknownIndicator")
        players = getPlayersDescription(fixture.value.scores)
    }

    return t("fixture.headerFormat", { round, players })
})
</script>

<template>
    <Dialog
        v-if="fixture"
        modal
        class="mx-4"
        v-model:visible="visible"
        :header="header"
        @hide="hide">
        <!-- HIGH: this component is a fucking mess. Render each part of it
        according to conditions, rather than rendering a distinct set of
        elements for each fixtures status. Also split it into smaller components -->
        <div v-if="hasStarted">
            <!-- MEDIUM: this is getting crowded. Design a better layout -->
            <div class="mb-2">
                <Clock
                    :elapsedMilliseconds="durationMilliseconds || elapsedMilliseconds"
                    :warnAfterMilliseconds="estimatedDurationMilliseconds" />

                <div class="p-fluid flex justify-content-center gap-2">
                    <!-- HIGH: show this even if the fixture has not started -->
                    <TableBadge v-if="table" :table="table" />

                    <RaceToBadge singular :value="raceTo" />
                </div>
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

            <!-- MEDIUM: create a component for this -->
            <div class="mb-2">
                <div v-if="!hasFinished" class="flex p-fluid mt-2">
                    <Textarea
                        class="text-xs md:text-sm"
                        rows="3"
                        :placeholder="t('fixture.addAComment')"
                        v-model="comment" />
                </div>

                <div v-else-if="comment">
                    <CommentMessage :comment="comment" />
                </div>
            </div>

            <div v-if="!hasFinished" class="p-fluid">
                <div class="grid m-0">
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
        <div v-else-if="fixtureStatus === FixtureStatus.WaitingForAssignment">
            <div class="p-fluid">
                <p class="m-0 text-center">
                    {{ t('fixture.pleaseAssignTable') }}
                </p>

                <LabelledDropdown
                    noLocalise
                    :label="t('table.table')"
                    :options="freeTablesOptions"
                    v-model="tableId" />

                <Button
                    type="button"
                    :label="t('common.assign')"
                    :disabled="!canAssignTable"
                    @click="assignTable" />
            </div>
        </div>
        <div v-else-if="fixtureStatus === FixtureStatus.WaitingForBreaker">
            <div class="p-fluid">
                <p class="m-0 text-center">
                    {{ t('fixture.whoWillBreakFirst') }}
                </p>

                <div class="grid m-0">
                    <PlayerBreakInput
                        v-for="p in players"
                        class="col-6"
                        :fixture="fixture"
                        :playerId="p"
                        :breakerId="breakerId"
                        @setBreakerId="breakerId = p" />
                </div>

                <Button
                    type="button"
                    :label="t('common.assign')"
                    :disabled="!canAssignBreaker"
                    @click="assignBreaker" />
            </div>
        </div>

        <!-- HIGH: show assigned table and breaker if the fixture is ready to start -->

        <div v-else class="p-fluid">
            <Button v-if="!hasStarted"
                type="button"
                :label="startButtonText"
                :disabled="!canStart"
                @click="startFixture" />
        </div>
    </Dialog>
</template>
