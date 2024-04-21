<script setup lang="ts">
import { useI18n } from "vue-i18n"

import LabelledCheckbox from "./LabelledCheckbox.vue"
import LabelledDropdown from "./LabelledDropdown.vue"

import { useSpecification } from "@/composables/useSpecification"

import { useSettingsStore } from "@/stores/settings"

const { t } = useI18n()

const settingsStore = useSettingsStore()

const {
    isKnockout,
    isRoundRobin,
} = useSpecification(settingsStore.settings.specification)
</script>

<template>
    <div>
        <!-- HIGH: improve layout on medium+ screens -->
        <div class="grid m-0">
            <div class="col-12 md:col-6 mb-0 p-0 p-fluid">
                <div class="md:mr-1">
                    <LabelledDropdown
                        :label="t('format.format')"
                        v-model="settingsStore.settings.specification.format"
                        :options="settingsStore.formatList" />
                </div>
            </div>

            <div class="col-12 md:col-6 p-0 p-fluid">
                <div class="md:ml-1">
                    <LabelledDropdown
                        :label="t('rules.rules')"
                        v-model="settingsStore.settings.specification.ruleSet"
                        :options="settingsStore.ruleSetList" />
                </div>
            </div>

            <div v-if="isRoundRobin"
                class="col-12 md:col-6 p-0 p-fluid">
                <div class="md:mr-1">
                    <LabelledDropdown
                        :label="t('tieBreaker.tieBreaker')"
                        v-model="settingsStore.settings.specification.tieBreaker"
                        :options="settingsStore.tieBreakerList" />
                </div>
            </div>
        </div>

        <div v-if="isKnockout || isRoundRobin">
            <p class="m-0 font-bold">
                {{ t('form.advanced') }}
            </p>

            <LabelledCheckbox
                class="mb-2"
                v-if="isKnockout"
                :label="t('form.randomlyDrawAllRounds')"
                v-model="settingsStore.settings.specification.randomlyDrawAllRounds" />

            <LabelledCheckbox
                class="mb-2"
                v-if="isRoundRobin"
                :label="t('form.requireCompletedRounds')"
                v-model="settingsStore.settings.specification.requireCompletedRounds" />

            <LabelledCheckbox
                class="mb-2"
                v-if="isRoundRobin"
                :label="t('form.allowEarlyFinish')"
                v-model="settingsStore.settings.specification.allowEarlyFinish" />
        </div>
    </div>
</template>
