<script setup lang="ts">
import { computed } from "vue"
import { useI18n } from "vue-i18n"

import DebugButtons from "./DebugButtons.vue"

import { useEnv } from "@/composables/useEnv"
import { useFixtureList } from "@/composables/useFixtureList"
import { useFlyer } from "@/composables/useFlyer"
import { usePhase } from "@/composables/usePhase"
import { usePhaseSettings } from "@/composables/usePhaseSettings"
import { usePhaseTiming } from "@/composables/usePhaseTiming"
import { useQueryParams } from "@/composables/useQueryParams"
import { useRounds } from "@/composables/useRounds"

import { useFlyerStore } from "@/stores/flyer"

const { t } = useI18n()

const props = defineProps<{
    sidebar?: boolean
}>()

const emit = defineEmits<{
    generateNextRound: []
    confirmFinish: []
    showAbandonModal: []
    goToPastFlyers: []
}>()

const flyerStore = useFlyerStore()

const {
    isDebug,
} = useEnv()

const {
    currentPhase,
} = useFlyer(flyerStore.flyer)

const {
    readyToGenerateNextRound,
} = usePhase(currentPhase.value)

const {
    remainingCount,
} = useFixtureList(currentPhase.value)

const {
    nextRoundToGenerate,
    generationIsComplete,
} = useRounds(currentPhase.value)

const {
    settings,
} = usePhaseSettings(currentPhase.value)

const {
    hasStarted,
    hasFinished,
} = usePhaseTiming(currentPhase.value)

const {
    isHistoric,
} = useQueryParams()

const generateNextRoundLabel = computed(() => {
    if (!nextRoundToGenerate.value) {
        return t('play.generateNextRound')
    }

    return t('play.generateRound', {
        round: nextRoundToGenerate.value.name,
    })
})

const finishButtonText = computed(() => {
    if (hasStarted.value && hasFinished.value) {
        return t('play.viewResults')
    }

    return t('common.finish')
})
</script>

<template>
    <div class="p-fluid">
        <DebugButtons v-if="!isHistoric && isDebug"
            :hideInstead="!props.sidebar" />

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
            :label="t('play.abandon')"
            severity="danger"
            @click="emit('showAbandonModal')" />

        <Button
            v-if="isHistoric"
            class="mb-2"
            :label="t('history.backToPastFlyers')"
            severity="info"
            @click="emit('goToPastFlyers')" />
    </div>
</template>
