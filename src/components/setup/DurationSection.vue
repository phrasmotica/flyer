<script setup lang="ts">
import { useI18n } from "vue-i18n"

import LabelledCheckbox from "./LabelledCheckbox.vue"
import MatchLengthModelSelect from "./MatchLengthModelSelect.vue"
import Stepper from "./Stepper.vue"

import { usePhaseSettingsInternal } from "@/composables/usePhaseSettings"
import { useSettings } from "@/composables/useSettings"

import { useSettingsStore } from "@/stores/settings"

const maxBestOfEnv = Number(import.meta.env.VITE_MAX_BEST_OF)
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
    <div class="p-fluid">
        <MatchLengthModelSelect />

        <div v-if="isRoundRobin">
            <div>
                <label for="matchLengthStepper" class="font-bold">
                    {{ t("matchLengthModel.allRounds") }}
                </label>

                <Stepper
                    inputId="matchLengthStepper"
                    v-model="settingsStore.settings.specification.bestOf"
                    :min="1" :max="maxBestOfEnv"
                    :prefix="t('matchLengthModel.bestOfPrefix')" />
            </div>

            <div class="mt-2">
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

            <div class="mt-2">
                <LabelledCheckbox
                    :label="t('form.allowDraws')"
                    v-model="settingsStore.settings.specification.allowDraws"
                    :disabled="!fixturesCanBeDrawn" />

                <Message v-if="allowDraws" class="m-0" :closable="false">
                    {{ t('matchLengthModel.nDrawsAllowed', bestOf! / 2) }}
                </Message>
            </div>
        </div>

        <div v-else-if="isKnockout && isFixedMatchLength">
            <label for="matchLengthStepper" class="font-bold">
                {{ t("matchLengthModel.allRounds") }}
            </label>

            <Stepper
                inputId="matchLengthStepper"
                v-model="settingsStore.settings.specification.raceTo"
                :min="1" :max="maxRaceEnv"
                :prefix="t('matchLengthModel.raceToPrefix')" />
        </div>

        <div v-else-if="isKnockout && isVariableMatchLength">
            <div v-for="r, i of roundNames" class="mb-2">
                <label :for="'raceToRoundStepper' + i" class="font-bold">
                    {{ r }}
                </label>

                <Stepper
                    :inputId="'raceToRoundStepper' + i"
                    v-model="settingsStore.settings.raceToPerRound[i]"
                    :min="1" :max="maxRaceEnv"
                    :prefix="t('matchLengthModel.raceToPrefix')" />
            </div>
        </div>

        <div v-else-if="isWinnerStaysOn">
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
</template>
