<script setup lang="ts">
import { computed } from "vue"
import { useI18n } from "vue-i18n"

import { useFlyer } from "@/composables/useFlyer"
import { useQueryParams } from "@/composables/useQueryParams"
import { useStandings } from "@/composables/useStandings"

import { useFlyerStore } from "@/stores/flyer"
import { useFlyerHistoryStore } from "@/stores/flyerHistory"

const { t } = useI18n()

const props = defineProps<{
    imageSaved: boolean
    sidebar?: boolean
}>()

const emit = defineEmits<{
    confirmStartPlayOff: []
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

const {
    flyer,
    mainPhase,
    isComplete,
    isFinished,
    phaseIsComplete,
} = useFlyer(flyerStore.flyer)

const {
    orderedTieBreakers,
} = useStandings(mainPhase.value)

const {
    isHistoric,
} = useQueryParams()

const nextPlayOff = computed(() => {
    const remaining = orderedTieBreakers.value.filter(t => !phaseIsComplete(t.id))
    return remaining.length > 0 ? remaining[0] : null
})

const hasPlayedOff = computed(() => !nextPlayOff.value)

const alreadySaved = computed(() => {
    return flyerHistoryStore.pastFlyers.some(f => f.id === flyer.value?.id)
})

const saveImageButtonText = computed(() => t(props.imageSaved ? "results.downloading" : "results.downloadImage"))

const saveButtonText = computed(() => t(alreadySaved.value ? 'results.flyerSaved' : 'results.saveFlyer'))

const playOffButtonText = computed(() => t('results.startPlayOffButton', {
    name: nextPlayOff.value?.name || t('playOff.unknownIndicator'),
}))
</script>

<template>
    <div class="p-fluid">
        <div v-if="!hasPlayedOff && !isComplete">
            <Button
                :label="playOffButtonText"
                @click="emit('confirmStartPlayOff')" />

            <Button
                class="mt-2"
                severity="warning"
                :label="'Skip this play-off'"
                @click="emit('confirmSkipPlayOff')" />
        </div>

        <div v-else-if="!isFinished">
            <Button
                severity="warning"
                :label="t('results.createPlayOff')"
                @click="emit('confirmCreatePlayOff')" />

            <Button
                class="mt-2"
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
