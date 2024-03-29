<script setup lang="ts">
import { computed } from "vue"

import ScoreCell from "./ScoreCell.vue"

import { useFlyer } from "../composables/useFlyer"
import { usePhase } from "../composables/usePhase"

import type { Fixture } from "../data/Fixture"

import { useFlyerStore } from "../stores/flyer"

const props = defineProps<{
    fixture: Fixture
    playerId: string
    winner: string
    ranOut: string
    finished?: boolean
}>()

const emit = defineEmits<{
    setWinner: []
    setRanOut: []
}>()

const flyerStore = useFlyerStore()

const {
    currentPhase,
} = useFlyer(flyerStore.flyer)

const {
    getPlayerName,
} = usePhase(currentPhase.value)

const breakerLabel = computed(() => {
    return props.fixture.breakerId === props.playerId ? "Broke" : "Did not break"
})

const didRunOut = computed(() => props.playerId === props.ranOut)
</script>

<template>
    <div class="flex flex-column align-items-center">
        <div class="font-bold">
            {{ getPlayerName(props.playerId) }}
        </div>

        <div class="mb-2">
            <Badge
                :value="breakerLabel"
                severity="secondary" />
        </div>

        <div v-if="props.finished" class="text-4xl font-bold">
            <ScoreCell
                large
                static
                simple
                :fixture="props.fixture"
                :isWinner="winner === props.playerId" />
        </div>

        <RadioButton v-else
            name="winner"
            :value="props.playerId"
            :modelValue="props.winner"
            @update:modelValue="emit('setWinner')" />

        <div class="text-xs mt-2">
            Ran Out
        </div>

        <div v-if="props.finished">
            <i v-if="didRunOut" class="pi pi-check" />
            <i v-else class="pi pi-times" />
        </div>

        <Checkbox v-else
            binary
            :modelValue="didRunOut"
            @update:modelValue="emit('setRanOut')" />
    </div>
</template>
