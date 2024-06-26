<script setup lang="ts">
import { onUpdated } from "vue"
import { useI18n } from "vue-i18n"
import { v4 as uuidv4 } from "uuid"

import ScoreCell from "./ScoreCell.vue"

import { useFixture } from "@/composables/useFixture"
import { useFlyer } from "@/composables/useFlyer"
import { usePlayers } from "@/composables/usePlayers"
import { useRounds } from "@/composables/useRounds"
import { useTweaks } from "@/composables/useTweaks"

import type { Fixture } from "@/data/Fixture"

import { useFlyerStore } from "@/stores/flyer"

const { t } = useI18n()

const score = defineModel<number>("score")
const runouts = defineModel<number>("runouts")

const props = defineProps<{
    fixture: Fixture
    playerId: string
    isWinner: boolean
    finished?: boolean
}>()

const flyerStore = useFlyerStore()

const {
    currentPhase,
} = useFlyer(flyerStore.flyer)

const {
    getRound,
} = useRounds(currentPhase.value)

const {
    getPlayerName,
} = usePlayers(currentPhase.value)

const {
    raceTo,
    isDraw,
} = useFixture("scoreInput", props.fixture, getRound(props.fixture.id), currentPhase.value)

const { blurNumberInputs } = useTweaks()

const scoreInputId = "player-score-input-" + uuidv4()
const runoutsInputId = "player-runouts-input-" + uuidv4()

onUpdated(() => {
    blurNumberInputs(scoreInputId)
    blurNumberInputs(runoutsInputId)
})
</script>

<template>
    <div class="flex flex-column align-items-center">
        <div class="font-bold" :class="[props.fixture.breakerId === props.playerId && 'underline']">
            {{ getPlayerName(props.playerId) || t("player.unknownIndicator") }}
        </div>

        <div v-if="props.finished">
            <ScoreCell
                large
                static
                :fixture="props.fixture"
                :score="score"
                :isWinner="props.isWinner"
                :isDraw="isDraw" />
        </div>

        <InputNumber v-else
            :id="scoreInputId"
            showButtons
            inputClass="w-4rem text-2xl font-bold py-1"
            buttonLayout="vertical"
            v-model="score"
            :min="0" :max="raceTo">
            <template #incrementbuttonicon>
                <span class="pi pi-plus" />
            </template>
            <template #decrementbuttonicon>
                <span class="pi pi-minus" />
            </template>
        </InputNumber>

        <div class="text-xs mt-2">
            {{ t('fixture.runouts') }}
        </div>

        <div v-if="props.finished">
            <Badge :value="runouts" severity="contrast" />
        </div>

        <InputNumber v-else
            :id="runoutsInputId"
            class="runout-stepper"
            showButtons
            inputClass="w-2rem px-1 text-center"
            buttonLayout="horizontal"
            v-model="runouts"
            :min="0" :max="raceTo">
            <template #incrementbuttonicon>
                <span class="pi pi-plus" />
            </template>
            <template #decrementbuttonicon>
                <span class="pi pi-minus" />
            </template>
        </InputNumber>
    </div>
</template>

<style>
.runout-stepper > * {
    padding-top: 0.25rem;
    padding-bottom: 0.25rem;
}

.runout-stepper > button.p-inputnumber-button {
    width: unset;
    padding: 0rem 0.5rem;
}

.runout-stepper > button.p-inputnumber-button > span.pi {
    font-size: 0.75rem;
}
</style>
