<script setup lang="ts">
import { useI18n } from "vue-i18n"

import CurrencyStepper from "./CurrencyStepper.vue"
import LabelledCheckbox from "./LabelledCheckbox.vue"
import LabelledDropdown from "./LabelledDropdown.vue"
import PrizePotSummary from "./PrizePotSummary.vue"

import { useSettingsStore } from "@/stores/settings"

const { t } = useI18n()

const settingsStore = useSettingsStore()
</script>

<template>
    <div>
        <LabelledCheckbox
            class="mb-2"
            :label="t('prizes.requireEntryFee')"
            v-model="settingsStore.settings.specification.entryFeeRequired" />

        <div v-if="settingsStore.settings.specification.entryFeeRequired">
            <div class="p-fluid mb-2">
                <label for="entryFeeStepper" class="font-bold">
                    {{ t("prizes.entryFee") }}
                </label>

                <CurrencyStepper
                    inputId="entryFeeStepper"
                    v-model="settingsStore.settings.specification.entryFee"
                    :min="5" :max="20" :step="5"
                    :suffix="t('prizes.entryFeeSuffix')" />
            </div>

            <LabelledDropdown
                :label="t('prizes.moneySplit')"
                v-model="settingsStore.settings.specification.moneySplit"
                :options="settingsStore.moneySplitOptions"
                :disabled="!settingsStore.settings.specification.entryFeeRequired" />

            <div class="mt-2 border-top-1 border-gray-200">
                <PrizePotSummary
                    :settings="settingsStore.settings.specification"
                    :playerCount="settingsStore.settings.playerCount" />
            </div>
        </div>
    </div>
</template>
