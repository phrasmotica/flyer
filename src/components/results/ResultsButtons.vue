<script setup lang="ts">
import { computed } from "vue"
import { useI18n } from "vue-i18n"

import DebugButtons from "./DebugButtons.vue"

import { useFlyer } from "@/composables/useFlyer"
import { usePlayers } from "@/composables/usePlayers"
import { useQueryParams } from "@/composables/useQueryParams"
import { usePhaseSpecification } from "@/composables/useSpecification"

import { useFlyerStore } from "@/stores/flyer"
import { useFlyerHistoryStore } from "@/stores/flyerHistory"
import { useUiStore } from "@/stores/ui"

const { t } = useI18n()

const props = defineProps<{
    imageSaved: boolean
    sidebar?: boolean
}>()

const emit = defineEmits<{
    confirmSkipPlayOff: []
    confirmCreatePlayOff: []
    confirmFinishFlyer: []
    save: []
    saveResults: []
    confirmGoToSetup: []
    goToPastFlyers: []
}>()

const flyerStore = useFlyerStore()
const flyerHistoryStore = useFlyerHistoryStore()
const uiStore = useUiStore()

const {
    flyer,
    mainPhase,
    isFinished,
    hasAlreadyPlayedOff,
} = useFlyer(flyerStore.flyer)

const {
    isRoundRobin,
    isWinnerStaysOn,
} = usePhaseSpecification(mainPhase.value)

const {
    players,
} = usePlayers(mainPhase.value)

const {
    isHistoric,
} = useQueryParams()

const alreadySaved = computed(() => {
    return flyerHistoryStore.pastFlyers.some(f => f.id === flyer.value?.id)
})

const saveImageButtonText = computed(() => t(props.imageSaved ? "results.downloading" : "results.downloadImage"))

const saveButtonText = computed(() => t(alreadySaved.value ? 'results.flyerSaved' : 'results.saveFlyer'))

const canCreatePlayOff = computed(() => {
    return players.value.filter(p => !hasAlreadyPlayedOff(p.id)).length > 1
})
</script>

<template>
    <div class="p-fluid">
        <div v-if="!isFinished">
            <DebugButtons v-if="!isHistoric && uiStore.isDebugMode"
                class="mb-2" />

            <Button v-if="!isHistoric && (isRoundRobin || isWinnerStaysOn)"
                class="mb-2"
                severity="warning"
                :label="t('results.createPlayOff')"
                :disabled="!canCreatePlayOff"
                @click="emit('confirmCreatePlayOff')" />

            <Button v-if="!isHistoric"
                :label="t('common.finish')"
                @click="emit('confirmFinishFlyer')" />
        </div>

        <div v-else>
            <div v-if="!isHistoric">
                <div class="p-fluid" :class="!props.sidebar && 'flex gap-2'">
                    <Button
                        class="mb-2"
                        :label="saveButtonText"
                        :disabled="alreadySaved"
                        @click="emit('save')" />

                    <Button
                        class="mb-2"
                        :label="saveImageButtonText"
                        :disabled="imageSaved"
                        @click="emit('saveResults')" />
                </div>

                <Button
                    :label="t('results.newFlyer')"
                    severity="info"
                    @click="emit('confirmGoToSetup')" />
            </div>

            <div v-else>
                <Button
                    :label="t('results.backToPastFlyers')"
                    severity="info"
                    @click="emit('goToPastFlyers')" />
            </div>
        </div>
    </div>
</template>
