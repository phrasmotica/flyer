<script setup lang="ts">
import { useI18n } from "vue-i18n"

import Clock from "../play/Clock.vue"
import InfoList from "./InfoList.vue"
import PrizePotSummary from "./PrizePotSummary.vue"

import { useSettings } from "@/composables/useSettings"

import { useSettingsStore } from "@/stores/settings"

const { t } = useI18n()

const props = defineProps<{
    sidebar?: boolean
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

settingsStore.$subscribe(() => {
    settings.value = settingsStore.settings
})
</script>

<template>
    <div>
        <div v-if="props.sidebar" class="p-fluid mb-2">
            <Button
                :label="t('common.start')"
                :disabled="isInvalid"
                @click="emit('confirmStart')" />
        </div>

        <div :class="[
            props.overflow && 'maxh-30 overflow-y-auto',
            props.sidebar && 'maxh-60 overflow-y-auto',
        ]">
            <InfoList
                :settings="settings.specification"
                :playerCount="settings.playerCount"
                :tableCount="settings.tableCount"
                :raceTos="raceTos" />

            <div
                v-if="settings.specification.entryFeeRequired"
                class="pt-2 border-top-1 border-gray-200 mb-2">
                <PrizePotSummary
                    :settings="settings.specification"
                    :playerCount="settings.playerCount" />
            </div>

            <div class="flex align-items-center justify-content-between pt-2 border-top-1 border-gray-200">
                <div>
                    {{ t('form.estimatedDuration') }} <em>{{ t('form.minsPerFrame', durationPerFrame) }}</em>
                </div>

                <div class="ml-2">
                    <Clock :elapsedMilliseconds="estimatedDurationMinutes * 60000" />
                </div>
            </div>
        </div>

        <div v-if="!props.sidebar" class="p-fluid mt-2">
            <Button
                :label="t('common.start')"
                :disabled="isInvalid"
                @click="emit('confirmStart')" />
        </div>
    </div>
</template>

<style scoped>
.maxh-30 {
    max-height: 30vh;
}

.maxh-60 {
    max-height: 60vh;
}
</style>
