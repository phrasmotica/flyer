<script setup lang="ts">
import { computed, ref, watch } from "vue"
import { useI18n } from "vue-i18n"

import AssignBreakerForm from "../play/AssignBreakerForm.vue"
import AssignTableForm from "../play/AssignTableForm.vue"
import FixtureInfo from "../play/FixtureInfo.vue"
import FixtureScoreForm from "../play/FixtureScoreForm.vue"

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
    getFixtureStatus,
    getPlayerName,
} = usePhase(currentPhase.value)

const phaseEvents = usePhaseEvents(currentPhase.value)

const {
    status: currentRoundStatus,
} = useRound(currentRound.value, currentPhase.value)

const {
    fixture,
    hasStarted,
    resumeClock,
} = useFixture("modal", props.fixture, getRound(props.fixture?.id || ""), currentPhase.value)

const visible = ref(props.visible)

watch(props, () => {
    visible.value = props.visible
    fixture.value = props.fixture
})

const startFixture = () => {
    if (!currentPhase.value || !fixture.value) {
        return
    }

    flyerStore.startFixture(currentPhase.value, fixture.value.id)

    const message = phaseEvents.fixtureStarted(fixture.value)
    flyerStore.addPhaseEvent(currentPhase.value, message)

    resumeClock()
}

const canStart = computed(() => canStartFixture(fixture.value, currentRoundStatus.value))

const fixtureStatus = computed(() => getFixtureStatus(fixture.value, currentRoundStatus.value))

const startButtonText = computed(() => {
    switch (fixtureStatus.value) {
        case FixtureStatus.Unknown:
            return t('fixture.unknownStatus')

        case FixtureStatus.WaitingForRoundGeneration:
            return t('fixture.waitingForRoundGenerationStatus')

        case FixtureStatus.WaitingForPreviousResult:
            return t('fixture.waitingForPreviousResultStatus')

        case FixtureStatus.WaitingForPlayers:
            return t('fixture.waitingForPlayersStatus')

        case FixtureStatus.WaitingForRound:
            return t('fixture.waitingForRoundStatus')

        case FixtureStatus.WaitingForTable:
            return t('fixture.waitingForTableStatus')

        default:
            return t('common.start')
    }
})

const hide = () => {
    emit('hide')
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
        <!-- MEDIUM: this is getting crowded. Design a better layout -->
        <div>
            <FixtureInfo :fixture="fixture" />
        </div>

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
