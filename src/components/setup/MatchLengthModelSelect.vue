<script setup lang="ts">
import { computed } from "vue"
import { useI18n } from "vue-i18n"

import { useSpecification } from "@/composables/usePhaseSettings"

import { useSettingsStore } from "@/stores/settings"

const { t } = useI18n()

const settingsStore = useSettingsStore()

const {
    isKnockout,
} = useSpecification(settingsStore.settings.specification)

const localisedOptions = computed(() => settingsStore.matchLengthModelList.map(x => ({
    ...x,
    summary: t(x.summary),
})))
</script>

<template>
    <SelectButton
        id="matchLengthModelSelect"
        v-model="settingsStore.settings.specification.matchLengthModel"
        :disabled="!isKnockout"
        :options="localisedOptions"
        optionLabel="summary"
        optionValue="value"
        aria-labelledby="basic" />
</template>
