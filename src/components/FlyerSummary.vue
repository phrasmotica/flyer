<script setup lang="ts">
import { computed } from "vue"

import Clock from "../components/Clock.vue"
import InfoList from "../components/InfoList.vue"
import PrizePotSummary from "../components/PrizePotSummary.vue"

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
    roundNames,
    durationPerFrame,
    estimatedDurationMinutes,
    isInvalid,
} = useSettings(settingsStore.settings)

const raceTos = computed(() => roundNames.value.map((n, i) => ({
    name: n,
    raceTo: settings.value.raceToPerRound[i],
})))
</script>

<template>
    <div>
        <div :class="[props.overflow && 'maxh-30 overflow-y-auto']">
            <InfoList :settings="settings.specification" :raceTos="raceTos" />

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
