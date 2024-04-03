<script setup lang="ts">
import { computed } from "vue"

import { useFlyer } from "../composables/useFlyer"
import { useQueryParams } from "../composables/useQueryParams"
import { useStandings } from "../composables/useStandings"

import { useFlyerStore } from "../stores/flyer"
import { useFlyerHistoryStore } from "../stores/flyerHistory"

const props = defineProps<{
    imageSaved: boolean
    sidebar?: boolean
}>()

const emit = defineEmits<{
    confirmStartPlayOff: []
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
    phaseIsComplete,
} = useFlyer(flyerStore.flyer)

const {
    requiresPlayOff,
    orderedPlayOffs,
} = useStandings(mainPhase.value)

const {
    isHistoric,
} = useQueryParams()

const nextPlayOff = computed(() => {
    const remaining = orderedPlayOffs.value.filter(p => !phaseIsComplete(p.id))
    return remaining.length > 0 ? remaining[0] : null
})

const hasPlayedOff = computed(() => !nextPlayOff.value)

const alreadySaved = computed(() => {
    return flyerHistoryStore.pastFlyers.some(f => f.id === flyer.value?.id)
})

const saveImageButtonText = computed(() => props.imageSaved ? "Downloading..." : "Download image")

const saveButtonText = computed(() => alreadySaved.value ? "Flyer saved!" : "Save flyer")

const playOffButtonText = computed(() => "Start the " + nextPlayOff.value?.name || "(UNKNOWN PLAY-OFF)")
</script>

<template>
    <div class="p-fluid">
        <div v-if="!hasPlayedOff && requiresPlayOff">
            <Button :label="playOffButtonText" @click="emit('confirmStartPlayOff')" />
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

                <Button label="New flyer" severity="info" @click="emit('confirmGoToSetup')" />
            </div>

            <div v-else>
                <Button
                    label="Back to past flyers"
                    severity="info"
                    @click="emit('goToPastFlyers')" />
            </div>
        </div>
    </div>
</template>
