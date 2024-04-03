<script setup lang="ts">
import { computed } from "vue"

import { useEnv } from "../composables/useEnv"
import { useFlyer } from "../composables/useFlyer"
import { usePhase } from "../composables/usePhase"
import { useQueryParams } from "../composables/useQueryParams"

import { useFlyerStore } from "../stores/flyer"
import { useUiStore } from "../stores/ui"

const emit = defineEmits<{
    autoComplete: []
    generateNextRound: []
    confirmFinish: []
    showAbandonModal: []
    goToPastFlyers: []
}>()

const flyerStore = useFlyerStore()
const uiStore = useUiStore()

const {
    isDebug,
} = useEnv()

const {
    currentPhase,
} = useFlyer(flyerStore.flyer)

const {
    settings,
    hasStarted,
    hasFinished,
    remainingCount,
    nextRoundToGenerate,
    readyToGenerateNextRound,
    generationIsComplete,
} = usePhase(currentPhase.value)

const {
    isHistoric,
} = useQueryParams()

const isFixtures = computed(() => uiStore.isFixtures)

const generateNextRoundLabel = computed(() => {
    if (nextRoundToGenerate.value) {
        return "Generate " + nextRoundToGenerate.value.name
    }

    return "Generate next round"
})

const finishButtonText = computed(() => {
    if (hasStarted.value && hasFinished.value) {
        return "View results"
    }

    return "Finish"
})
</script>

<template>
    <div class="p-fluid">
        <Button
            v-if="isDebug && !isHistoric && isFixtures && remainingCount > 0"
            class="mb-2"
            label="Auto-complete"
            severity="help"
            @click="emit('autoComplete')" />

        <Button
            v-if="!isHistoric && settings.randomlyDrawAllRounds && !generationIsComplete"
            class="mb-2"
            :label="generateNextRoundLabel"
            :disabled="!readyToGenerateNextRound"
            @click="emit('generateNextRound')" />

        <Button
            v-else
            class="mb-2"
            :label="finishButtonText"
            :disabled="!settings.allowEarlyFinish && remainingCount > 0"
            @click="emit('confirmFinish')" />

        <Button
            v-if="!hasFinished"
            class="mb-2"
            label="Abandon"
            severity="danger"
            @click="emit('showAbandonModal')" />

        <Button
            v-if="isHistoric"
            class="mb-2"
            label="Back to past flyers"
            severity="info"
            @click="emit('goToPastFlyers')" />
    </div>
</template>
