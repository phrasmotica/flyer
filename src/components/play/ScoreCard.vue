<script setup lang="ts">
import { computed, watch } from "vue"
import { useI18n } from "vue-i18n"

import ScoreCell from "./ScoreCell.vue"

import { useFixture } from "@/composables/useFixture"
import { useFixtureList } from "@/composables/useFixtureList"
import { useFlyer } from "@/composables/useFlyer"
import { usePlayers } from "@/composables/usePlayers"
import { useRounds } from "@/composables/useRounds"
import { usePhaseSpecification } from "@/composables/useSpecification"

import type { Fixture } from "@/data/Fixture"

import { useFlyerStore } from "@/stores/flyer"

const { t } = useI18n()

const props = defineProps<{
    fixture: Fixture
    scoreIndex: number
    position: "left" | "right"
    highlightedFixtureId: string
    static?: boolean
}>()

const emit = defineEmits<{
    showModal: []
    highlight: []
}>()

const flyerStore = useFlyerStore()

const {
    currentPhase,
} = useFlyer(flyerStore.flyer)

const {
    getPossiblePlayers,
} = useFixtureList(currentPhase.value)

const {
    getPlayerName,
} = usePlayers(currentPhase.value)

const {
    getRound,
} = useRounds(currentPhase.value)

const {
    fixture,
    round,
    winner,
    isDraw,
    isWalkover,
} = useFixture("card", props.fixture, getRound(props.fixture.id), currentPhase.value)

const {
    isWinnerStaysOn,
    isRandomDraw,
} = usePhaseSpecification(currentPhase.value)

watch(props, () => {
    fixture.value = props.fixture
    round.value = getRound(props.fixture.id)
})

const score = computed(() => fixture.value!.scores[props.scoreIndex])

const isHighlighted = computed(() => {
    const parentFixture = fixture.value!.parentFixtures[props.scoreIndex]
    return !!props.highlightedFixtureId && props.highlightedFixtureId === parentFixture?.fixtureId
})

const parentFixture = computed(() => fixture.value!.parentFixtures.at(props.scoreIndex))

const playerCellClass = computed(() => [
    isHighlighted.value && parentFixture.value?.takeLoser && 'loser',
    isHighlighted.value && 'highlight text-white',
    !props.static && 'cursor-pointer',
])

const textAlignClass = computed(() => `text-${props.position}`)

const directionClass = computed(() => {
    return props.position === 'left' ? 'flex-row' : 'flex-row-reverse'
})

const marginClass = (size: 1 | 2) => {
    const direction = props.position === 'left' ? 'r' : 'l'
    return `m${direction}-${size}`
}

const paddingClass = (size: 1 | 2) => {
    const direction = props.position === 'left' ? 'r' : 'l'
    return `p${direction}-${size}`
}

const playerNameClass = computed(() => {
    let c = ""

    if (fixture.value?.breakerId === score.value.playerId) {
        c += " underline"
    }

    if (winner.value) {
        if (winner.value === score.value.playerId) {
            c += " font-bold"
        }
        else if (!isHighlighted.value){
            c += " text-color-secondary"
        }
    }

    return c.trim()
})

const getPlayerDescription = (fixture: Fixture, slot: number) => {
    const score = fixture.scores[slot]

    if (score.isBye) {
        return t('player.byeIndicator')
    }

    const ids = getPossiblePlayers(fixture, slot)
    if (ids.length > 0) {
        return ids.map(getPlayerName).join("/")
    }

    return t('player.unknownIndicator')
}

const handleClick = () => {
    if (!isWalkover.value) {
        emit("showModal")
    }
}
</script>

<template>
    <div v-if="fixture"
        class="flex align-items-center justify-content-between"
        :class="[directionClass, paddingClass(1)]">
        <div
            class="p-1 border-round-md flex-1"
            :class="[playerCellClass, textAlignClass, marginClass(1)]"
            @click="() => emit('highlight')">
            <span v-if="score.isBye" class="text-gray-400">
                <em>{{ t('player.byeIndicator') }}</em>
            </span>

            <span v-else-if="score.playerId" :class="playerNameClass">
                {{ getPlayerDescription(fixture, props.scoreIndex) }}
            </span>

            <span v-else-if="parentFixture?.fixtureId || isRandomDraw">
                <em class="text-gray-400">
                    {{ t('player.pendingIndicator') }}
                </em>
            </span>
        </div>

        <Badge v-if="score.runouts > 0"
            class="p-badge-sm"
            :class="[marginClass(1), !props.static && 'cursor-pointer']"
            :value="isWinnerStaysOn ? t('score.runout') : score.runouts"
            severity="contrast"
            @click="handleClick" />

        <ScoreCell
            :static="props.static"
            :fixture="fixture"
            :score="score.score"
            :runouts="score.runouts"
            :isWinner="winner === score.playerId"
            :isDraw="isDraw"
            :simple="isWinnerStaysOn"
            @clicked="handleClick" />
    </div>
</template>
