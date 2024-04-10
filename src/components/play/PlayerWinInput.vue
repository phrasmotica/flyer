<script setup lang="ts">
import { computed } from "vue"
import { useI18n } from "vue-i18n"

import ScoreCell from "./ScoreCell.vue"

import { useFlyer } from "@/composables/useFlyer"
import { usePhase } from "@/composables/usePhase"

import type { Fixture } from "@/data/Fixture"

import { useFlyerStore } from "@/stores/flyer"

const { t } = useI18n()

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

const didRunOut = computed(() => props.playerId === props.ranOut)
</script>

<template>
    <div class="flex flex-column align-items-center">
        <div class="font-bold" :class="[props.fixture.breakerId === props.playerId && 'underline']">
            {{ getPlayerName(props.playerId) || t("player.unknownIndicator") }}
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
            {{ t("fixture.ranOut") }}
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
