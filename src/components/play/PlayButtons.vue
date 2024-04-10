<script setup lang="ts">
import { computed } from "vue"
import { useI18n } from "vue-i18n"

import { useEnv } from "@/composables/useEnv"
import { useFlyer } from "@/composables/useFlyer"
import { usePhase } from "@/composables/usePhase"
import { useQueryParams } from "@/composables/useQueryParams"

import { useFlyerStore } from "@/stores/flyer"
import { useUiStore } from "@/stores/ui"

const { t } = useI18n()

const props = defineProps<{
    sidebar?: boolean
}>()

const emit = defineEmits<{
    autoComplete: []
    autoCompleteRemaining: []
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

const showAutoCompleteButton = computed(() => {
    if (isHistoric.value || !isDebug) {
        return false
    }

    return props.sidebar || remainingCount.value > 0
})

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
        <div>
            <!-- debug stuff, no need to localise -->
            <Button
                v-if="showAutoCompleteButton"
                class="mb-2"
                label="Auto-complete"
                severity="help"
                :disabled="!isFixtures || remainingCount <= 0"
                @click="emit('autoComplete')" />

            <Button
                v-if="showAutoCompleteButton"
                class="mb-2"
                label="Auto-complete remaining"
                severity="help"
                :disabled="!isFixtures || remainingCount <= 0"
                @click="emit('autoCompleteRemaining')" />
        </div>

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
