<script setup lang="ts">
import { computed, ref, watch } from "vue"
import { useI18n } from "vue-i18n"

import AssignBreakerForm from "../play/AssignBreakerForm.vue"
import AssignTableForm from "../play/AssignTableForm.vue"
import Clock from "../play/Clock.vue"
import FixtureScoreForm from "../play/FixtureScoreForm.vue"
import RaceToBadge from "../play/RaceToBadge.vue"
import TableBadge from "../play/TableBadge.vue"

import { useFixture } from "@/composables/useFixture"
import { useFlyer } from "@/composables/useFlyer"
import { FixtureStatus, usePhase } from "@/composables/usePhase"
import { usePhaseEvents } from "@/composables/usePhaseEvents"
import { useRound } from "@/composables/useRound"

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
    currentRound,
    canStartFixture,
    getRound,
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
    elapsedMilliseconds,
    hasStarted,
    hasFinished,
    isInProgress,
    estimatedDurationMilliseconds,
    durationMilliseconds,
    resumeClock,
} = useFixture("modal", props.fixture, getRound(props.fixture?.id || ""), currentPhase.value)

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

    setInitialPlayerScores(props.fixture)

    if (props.visible && isInProgress.value) {
        resumeClock()
    }
})

const startFixture = () => {
    if (!currentPhase.value || !fixture.value || !table.value || !breaker.value) {
        return
    }

    flyerStore.startFixture(currentPhase.value, fixture.value.id)

    const message = phaseEvents.fixtureStarted(fixture.value)
    flyerStore.addPhaseEvent(currentPhase.value, message)

    resumeClock()
}

const table = computed(() => getTable(fixture.value?.tableId || ""))
const breaker = computed(() => getPlayer(fixture.value?.breakerId || ""))

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

        <div id="fixture-info">
            <div v-if="table" class="mb-2">
                <Clock
                    v-if="hasStarted"
                    :elapsedMilliseconds="durationMilliseconds || elapsedMilliseconds"
                    :warnAfterMilliseconds="estimatedDurationMilliseconds" />

                <div class="p-fluid flex justify-content-center gap-2">
                    <TableBadge :table="table" />

                    <RaceToBadge singular :value="raceTo" />
                </div>
            </div>

            <!-- HIGH: show assigned breaker if applicable -->
        </div>

        <!-- MEDIUM: this is getting crowded. Design a better layout -->

        <div v-if="hasStarted">
            <FixtureScoreForm
                :fixture="fixture"
                @hide="hide" />
        </div>

        <div v-else-if="fixtureStatus === FixtureStatus.WaitingForAssignment">
            <AssignTableForm :fixture="fixture" />
        </div>

        <div v-else-if="fixtureStatus === FixtureStatus.WaitingForBreaker">
            <AssignBreakerForm :fixture="fixture" />
        </div>

        <div v-else class="p-fluid">
            <Button v-if="!hasStarted"
                type="button"
                :label="startButtonText"
                :disabled="!canStart"
                @click="startFixture" />
        </div>
    </Dialog>
</template>
