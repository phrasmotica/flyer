<script setup lang="ts">
import { computed, watch } from "vue"
import { useI18n } from "vue-i18n"

import ScoreCell from "./ScoreCell.vue"
import TableBadge from "./TableBadge.vue"

import { useEnv } from "@/composables/useEnv"
import { useFixture } from "@/composables/useFixture"
import { useFlyer } from "@/composables/useFlyer"
import { usePhase } from "@/composables/usePhase"
import { usePhaseSettings } from "@/composables/usePhaseSettings"
import { useRound } from "@/composables/useRound"
import { useTimedRef } from "@/composables/useTimedRef"

import { Prioritisation, type Fixture } from "@/data/Fixture"

import { useFlyerStore } from "@/stores/flyer"

const { t } = useI18n()

const props = defineProps<{
    fixture: Fixture
    highlightedFixtureId: string
    showComment: boolean
}>()

const emit = defineEmits<{
    showModal: []
    highlight: [fixtureId: string]
}>()

const {
    isDebug,
} = useEnv()

const flyerStore = useFlyerStore()

const {
    currentPhase,
} = useFlyer(flyerStore.flyer)

const {
    settings,
    unacknowledgedSwap,
    currentRound,
    nextFreeFixture,
    canStartFixture,
    getRound,
    getTable,
    getPlayerName,
    acknowledgeSwap,
} = usePhase(currentPhase.value)

const {
    status,
} = useRound(currentRound.value, currentPhase.value)

const {
    fixture,
    round,
    winner,
    isWalkover,
} = useFixture("card", props.fixture, getRound(props.fixture.id), currentPhase.value)

const {
    isWinnerStaysOn,
    isRandomDraw,
} = usePhaseSettings(settings.value)

watch(props, () => {
    fixture.value = props.fixture
    round.value = getRound(props.fixture.id)

    if (!unacknowledgedSwap.value) {
        return
    }

    let status = Prioritisation.None

    if (unacknowledgedSwap.value.fixtureBId === props.fixture.id) {
        status = Prioritisation.Up
    }

    if (unacknowledgedSwap.value.fixtureAId === props.fixture.id) {
        status = Prioritisation.Down
    }

    prioritisationStatus.value = status

    if (status !== Prioritisation.None) {
        acknowledgeSwap(unacknowledgedSwap.value.id)
    }
})

const {
    value: prioritisationStatus,
} = useTimedRef(2000, Prioritisation.None)

const isUp = computed(() => prioritisationStatus.value === Prioritisation.Up)
const isDown = computed(() => prioritisationStatus.value === Prioritisation.Down)

const table = computed(() => getTable(fixture.value?.tableId || ""))

const isHighlighted = (slot: 0 | 1) => {
    const parentFixture = fixture.value?.parentFixtures[slot]
    return !!props.highlightedFixtureId && props.highlightedFixtureId === parentFixture?.fixtureId
}

const playerNameClass = (playerId: string, slot: 0 | 1) => {
    let c = ""

    if (fixture.value?.breakerId === playerId) {
        c += " underline"
    }

    if (winner.value) {
        if (winner.value === playerId) {
            c += " font-bold"
        }
        else if (!isHighlighted(slot)){
            c += " text-color-secondary"
        }
    }

    return c.trim()
}

const handleClick = () => {
    if (!isWalkover.value) {
        emit("showModal")
    }
}

const handleNameClick = (id: string) => {
    if (id) {
        emit('highlight', id)
    }
}

const fixtureCardClass = (fixture: Fixture) => {
    return [
        fixture.id === props.highlightedFixtureId ? 'border-dashed' : 'border-transparent',
        isDebug && canStartFixture(fixture, status.value) && 'border border-yellow-500',
        isDebug && fixture.id === nextFreeFixture.value?.id && 'border border-red-500',
    ]
}

const playerCellClass = (fixture: Fixture, slot: 0 | 1) => {
    const parentFixture = fixture.parentFixtures[slot]

    return [
        isHighlighted(slot) && parentFixture?.takeLoser && 'loser',
        isHighlighted(slot) && 'highlight text-white',
        'cursor-pointer',
    ]
}
</script>

<template>
    <div
        v-if="fixture"
        class="border-round-md border-1"
        :class="fixtureCardClass(fixture)">
        <div v-if="table && !fixture.finishTime" class="text-center">
            <TableBadge :table="table" />
        </div>

        <div class="grid m-0 py-1">
            <!-- HIGH: create a component for these two divs -->
            <div class="flex align-items-center justify-content-between col-6 p-0 pr-1">
                <div
                    class="p-1 mr-1 border-round-md text-left flex-1"
                    :class="playerCellClass(fixture, 0)"
                    @click="() => handleNameClick(fixture!.id)">
                    <span v-if="fixture.scores[0].isBye" class="text-gray-400">
                        <em>{{ t('player.byeIndicator') }}</em>
                    </span>

                    <span v-else-if="fixture.scores[0].playerId" :class="playerNameClass(fixture.scores[0].playerId, 0)">
                        {{ getPlayerName(fixture.scores[0].playerId) || t('player.unknownIndicator') }}
                    </span>

                    <span v-else-if="fixture.parentFixtures[0]?.fixtureId || isRandomDraw">
                        <em class="text-gray-400">
                            {{ t('player.pendingIndicator') }}
                        </em>
                    </span>
                </div>

                <Badge v-if="fixture.scores[0].runouts > 0"
                    class="p-badge-sm mr-1 cursor-pointer"
                    :value="isWinnerStaysOn ? t('score.runout') : fixture.scores[0].runouts"
                    severity="contrast"
                    @click="handleClick" />

                <i v-if="isUp" class="pi pi-arrow-up font-bold mr-2" style="color: green" />
                <i v-else-if="isDown" class="pi pi-arrow-down font-bold mr-2" style="color: red" />
                <ScoreCell v-else
                    :fixture="fixture"
                    :score="fixture.scores[0].score"
                    :runouts="fixture.scores[0].runouts"
                    :isWinner="winner === fixture.scores[0].playerId"
                    :simple="isWinnerStaysOn"
                    @clicked="handleClick" />
            </div>

            <div class="flex align-items-center justify-content-between col-6 p-0 pl-1">
                <i v-if="isUp" class="pi pi-arrow-up font-bold ml-2" style="color: green" />
                <i v-else-if="isDown" class="pi pi-arrow-down font-bold ml-2" style="color: red" />
                <ScoreCell v-else
                    :fixture="fixture"
                    :score="fixture.scores[1].score"
                    :runouts="fixture.scores[1].runouts"
                    :isWinner="winner === fixture.scores[1].playerId"
                    :simple="isWinnerStaysOn"
                    @clicked="handleClick" />

                <Badge v-if="fixture.scores[1].runouts > 0"
                    class="p-badge-sm ml-1 cursor-pointer"
                    :value="isWinnerStaysOn ? t('score.runout') : fixture.scores[1].runouts"
                    severity="contrast"
                    @click="handleClick" />

                <div
                    class="p-1 ml-1 border-round-md text-right flex-1"
                    :class="playerCellClass(fixture, 1)"
                    @click="() => handleNameClick(fixture!.id)">
                    <span v-if="fixture.scores[1].isBye" class="text-gray-400">
                        <em>{{ t('player.byeIndicator') }}</em>
                    </span>

                    <span v-else-if="fixture.scores[1].playerId" :class="playerNameClass(fixture.scores[1].playerId, 1)">
                        {{ getPlayerName(fixture.scores[1].playerId) || t('player.unknownIndicator') }}
                    </span>

                    <span v-else-if="fixture.parentFixtures[1]?.fixtureId || isRandomDraw">
                        <em class="text-gray-400">
                            {{ t('player.pendingIndicator') }}
                        </em>
                    </span>
                </div>
            </div>
        </div>

        <!-- MEDIUM: format this better -->
        <div v-if="props.showComment && fixture.comment" class="mt-1 pt-1 border-top-1 border-none border-dashed border-gray-200">
            <p class="m-0 text-xs md:text-sm">
                {{ fixture.comment }}
            </p>
        </div>
    </div>
</template>

<style scoped>
.p-badge.p-badge-sm {
    font-size: 0.75rem;
    min-width: 1.25rem;
    height: 1.25rem;
    line-height: 1.25rem;
}

.highlight {
    background-color: darkgreen!important;
}

.highlight.loser {
    background-color: firebrick!important;
}
</style>
