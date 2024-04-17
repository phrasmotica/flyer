<script setup lang="ts">
import { useI18n } from "vue-i18n"

import LabelledCheckbox from "./LabelledCheckbox.vue"
import LabelledDropdown from "./LabelledDropdown.vue"
import MatchLengthModelSelect from "./MatchLengthModelSelect.vue"
import Stepper from "./Stepper.vue"

import { usePhaseSettingsInternal } from "@/composables/usePhaseSettings"
import { useSettings } from "@/composables/useSettings"

import { useSettingsStore } from "@/stores/settings"

const maxRaceEnv = Number(import.meta.env.VITE_MAX_RACE)

const { t } = useI18n()

const settingsStore = useSettingsStore()

const {
    roundNames,
} = useSettings(settingsStore.settings)

const {
    bestOf,
    isFixedMatchLength,
    isVariableMatchLength,
    isKnockout,
    isRoundRobin,
    isWinnerStaysOn,
    fixturesCanBeDrawn,
    allowDraws,
} = usePhaseSettingsInternal(settingsStore.settings.specification)
</script>

<template>
    <div>
        <!-- HIGH: create a separate section/tab for selecting match lengths -->
        <div class="p-fluid mb-1">
            <MatchLengthModelSelect />
        </div>

        <div class="mb-2 px-2 border-1 border-gray-200 border-round-md">
            <div v-if="isRoundRobin || (isKnockout && isFixedMatchLength)" class="p-fluid mb-2">
                <label for="raceToStepper" class="font-bold">
                    {{ t("matchLengthModel.allRounds") }}
                </label>

                <Stepper
                    inputId="raceToStepper"
                    v-model="settingsStore.settings.specification.bestOf"
                    :min="1" :max="maxRaceEnv"
                    :prefix="t('matchLengthModel.bestOfPrefix')" />
            </div>

            <div v-else-if="isKnockout && isVariableMatchLength">
                <div v-for="r, i of roundNames" class="p-fluid mb-2">
                    <label :for="'raceToRoundStepper' + i" class="font-bold">
                        {{ r }}
                    </label>

                    <Stepper
                        :inputId="'raceToRoundStepper' + i"
                        v-model="settingsStore.settings.bestOfPerRound[i]"
                        :min="1" :max="maxRaceEnv"
                        :prefix="t('matchLengthModel.bestOfPrefix')" />
                </div>
            </div>

            <div v-if="isRoundRobin">
                <LabelledCheckbox
                    :label="t('form.allowDraws')"
                    v-model="settingsStore.settings.specification.allowDraws"
                    :disabled="!fixturesCanBeDrawn" />

                <Message v-if="allowDraws" class="m-0 mb-2" :closable="false">
                    {{ t('matchLengthModel.nDrawsAllowed', bestOf! / 2) }}
                </Message>
            </div>

            <div v-if="isWinnerStaysOn" class="p-fluid mb-2">
                <label for="winsRequiredStepper" class="font-bold">
                    {{ t('matchLengthModel.winsRequired') }}
                </label>

                <Stepper
                    inputId="winsRequiredStepper"
                    v-model="settingsStore.settings.specification.winsRequired"
                    :min="settingsStore.settings.playerCount - 1" :max="maxRaceEnv"
                    :suffix="t(settingsStore.settings.specification.winsRequired !== 1 ? 'matchLengthModel.winsSuffix' : 'matchLengthModel.winSuffix')" />

                <Message class="m-0 mt-2" severity="info" :closable="false">
                    {{ t('matchLengthModel.winsRequiredLimit', {
                        limit: settingsStore.settings.playerCount - 1,
                    }) }}
                </Message>
            </div>
        </div>

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

            <div v-if="isRoundRobin"
                class="col-12 md:col-6 p-0 p-fluid">
                <div class="md:ml-1 mb-2">
                    <label for="stageCountStepper" class="font-bold">
                        {{ t('stages.numberOfStages') }}
                    </label>

                    <Stepper
                        inputId="stageCountStepper"
                        v-model="settingsStore.settings.specification.stageCount"
                        :min="1" :max="4"
                        :suffix="settingsStore.settings.specification.stageCount > 1 ? t('stages.stagesSuffix') : t('stages.stageSuffix')" />

                    <Message class="m-0 mt-2" severity="info" :closable="false">
                        {{ t('stages.stagesDescription') }}
                    </Message>
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
