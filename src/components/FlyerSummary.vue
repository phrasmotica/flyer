<script setup lang="ts">
import Clock from "./Clock.vue"
import InfoList from "./InfoList.vue"
import PrizePotSummary from "./PrizePotSummary.vue"

import { useSettings } from "../composables/useSettings"

import { useSettingsStore } from "../stores/settings"

const props = defineProps<{
    overflow?: boolean
}>()

const emit = defineEmits<{
    confirmStart: []
}>()

const settingsStore = useSettingsStore()

const {
    settings,
    raceTos,
    durationPerFrame,
    estimatedDurationMinutes,
    isInvalid,
} = useSettings(settingsStore.settings)
</script>

<template>
    <div>
        <div :class="[props.overflow && 'maxh-30 overflow-y-auto']">
            <InfoList
                :settings="settings.specification"
                :playerCount="settings.playerCount"
                :raceTos="raceTos" />

            <div
                v-if="settings.specification.entryFeeRequired"
                class="pt-2 border-top-1 border-gray-200 mb-2">
                <PrizePotSummary
                    :settings="settings.specification"
                    :playerCount="settings.playerCount" />
            </div>

            <div class="flex align-items-center justify-content-between pt-2 border-top-1 border-gray-200 mb-2">
                <div>
                    Estimated duration <em>({{ durationPerFrame }} min(s) per frame)</em>
                </div>

                <div class="ml-2">
                    <Clock :elapsedMilliseconds="estimatedDurationMinutes * 60000" />
                </div>
            </div>
        </div>

        <div class="p-fluid">
            <Button label="Start" :disabled="isInvalid" @click="emit('confirmStart')" />
        </div>
    </div>
</template>

<style scoped>
.maxh-30 {
    max-height: 30vh;
}
</style>
