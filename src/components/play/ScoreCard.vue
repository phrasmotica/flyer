<script setup lang="ts">
import { computed, ref, watch } from "vue"
import { useI18n } from "vue-i18n"

import ScoreCell from "./ScoreCell.vue"

import { useFixture } from "@/composables/useFixture"
import { useFlyer } from "@/composables/useFlyer"
import { usePhaseSettings } from "@/composables/usePhaseSettings"
import { usePlayers } from "@/composables/usePlayers"
import { useRounds } from "@/composables/useRounds"

import type { Fixture } from "@/data/Fixture"
import { Prioritisation } from "@/data/FixtureSwap"

import { useFlyerStore } from "@/stores/flyer"

const { t } = useI18n()

const props = defineProps<{
    fixture: Fixture
    scoreIndex: number
    position: "left" | "right"
    highlightedFixtureId: string
    prioritisationStatus: Prioritisation
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
} = usePhaseSettings(currentPhase.value)

watch(props, () => {
    fixture.value = props.fixture
    round.value = getRound(props.fixture.id)
    prioritisationStatus.value = props.prioritisationStatus
})

const prioritisationStatus = ref(props.prioritisationStatus)

const score = computed(() => fixture.value!.scores[props.scoreIndex])
const isUp = computed(() => prioritisationStatus.value === Prioritisation.Up)
const isDown = computed(() => prioritisationStatus.value === Prioritisation.Down)

const isHighlighted = computed(() => {
    const parentFixture = fixture.value!.parentFixtures[props.scoreIndex]
    return !!props.highlightedFixtureId && props.highlightedFixtureId === parentFixture?.fixtureId
})

const parentFixture = computed(() => fixture.value!.parentFixtures.at(props.scoreIndex))

const playerCellClass = computed(() => [
    isHighlighted.value && parentFixture.value?.takeLoser && 'loser',
    isHighlighted.value && 'highlight text-white',
    'cursor-pointer',
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

const handleClick = () => {
    if (!isWalkover.value) {
        emit("showModal")
    }
}
</script>

<template>
    <div class="flex align-items-center justify-content-between col-6 p-0"
        :class="[directionClass, paddingClass(1)]">
        <div
            class="p-1 border-round-md flex-1"
            :class="[playerCellClass, textAlignClass, marginClass(1)]"
            @click="() => emit('highlight')">
            <span v-if="score.isBye" class="text-gray-400">
                <em>{{ t('player.byeIndicator') }}</em>
            </span>

            <span v-else-if="score.playerId" :class="playerNameClass">
                {{ getPlayerName(score.playerId) || t('player.unknownIndicator') }}
            </span>

            <span v-else-if="parentFixture?.fixtureId || isRandomDraw">
                <em class="text-gray-400">
                    {{ t('player.pendingIndicator') }}
                </em>
            </span>
        </div>

        <Badge v-if="score.runouts > 0"
            class="p-badge-sm cursor-pointer"
            :class="marginClass(1)"
            :value="isWinnerStaysOn ? t('score.runout') : score.runouts"
            severity="contrast"
            @click="handleClick" />

        <div>
            <i v-if="isUp"
                class="pi pi-arrow-up font-bold"
                :class="marginClass(2)"
                style="color: green" />

            <i v-else-if="isDown"
                class="pi pi-arrow-down font-bold"
                :class="marginClass(2)"
                style="color: red" />

            <ScoreCell v-else
                :fixture="fixture!"
                :score="score.score"
                :runouts="score.runouts"
                :isWinner="winner === score.playerId"
                :isDraw="isDraw"
                :simple="isWinnerStaysOn"
                @clicked="handleClick" />
        </div>
    </div>
</template>
