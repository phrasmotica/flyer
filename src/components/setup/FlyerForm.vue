<script setup lang="ts">
import { computed, onUpdated } from "vue"
import { useI18n } from "vue-i18n"
import type { MenuItem } from "primevue/menuitem"

import CurrencyStepper from "./CurrencyStepper.vue"
import LabelledCheckbox from "./LabelledCheckbox.vue"
import LabelledDropdown from "./LabelledDropdown.vue"
import LabelledSlider from "./LabelledSlider.vue"
import MatchLengthModelSelect from "./MatchLengthModelSelect.vue"
import NameInput from "./NameInput.vue"
import PrizePotSummary from "./PrizePotSummary.vue"
import Stepper from "./Stepper.vue"
import TableInput from "./TableInput.vue"

import { usePhaseSettings } from "@/composables/usePhaseSettings"
import { useSettings } from "@/composables/useSettings"
import { useTweaks } from "@/composables/useTweaks"

import { FlyerFormSection } from "@/data/UiSettings"

import { useSettingsStore } from "@/stores/settings"
import { useUiStore } from "@/stores/ui"

const maxPlayersEnv = Number(import.meta.env.VITE_MAX_PLAYERS)
const maxRaceEnv = Number(import.meta.env.VITE_MAX_RACE)

const settingsStore = useSettingsStore()
const uiStore = useUiStore()

const {
    estimatedCost,
    roundNames,
} = useSettings(settingsStore.settings)

const {
    isFixedMatchLength,
    isVariableMatchLength,
    isKnockout,
    isRoundRobin,
    isWinnerStaysOn,
} = usePhaseSettings(settingsStore.settings.specification)

const { n, t } = useI18n()

const { blurNumberInputs } = useTweaks()

const items = computed(() => <MenuItem[]>[
    {
        icon: 'pi pi-user',
        command: _ => uiStore.settings.flyerFormSection = FlyerFormSection.Players,
    },
    {
        icon: 'pi pi-book',
        command: _ => uiStore.settings.flyerFormSection = FlyerFormSection.Settings,
    },
    {
        icon: 'pi pi-building',
        command: _ => uiStore.settings.flyerFormSection = FlyerFormSection.Tables,
    },
    {
        icon: 'pi pi-pound',
        command: _ => uiStore.settings.flyerFormSection = FlyerFormSection.Prizes,
    },
])

const maxTableCount = computed(() => {
    if (isWinnerStaysOn.value) {
        return 1
    }

    return Math.floor(settingsStore.settings.playerCount / 2)
})

onUpdated(() => {
    blurNumberInputs("form-content")
})
</script>

<template>
    <div>
        <TabMenu
            class="mb-2"
            :model="items"
            :activeIndex="uiStore.flyerFormSection" />

        <!-- LOW: only make the form content overflow with a scroll bar, not the tab menu also -->
        <div id="form-content">
            <div v-if="uiStore.flyerFormSection === FlyerFormSection.Players">
                <div class="p-fluid">
                    <label for="playersStepper" class="font-bold">
                        {{ t("form.players") }}
                    </label>

                    <!-- MEDIUM: show/hide these via useScreenSizes() -->
                    <div class="md:hidden mb-2">
                        <Stepper
                            v-model="settingsStore.settings.playerCount"
                            :min="2" :max="maxPlayersEnv"
                            :suffix="t(settingsStore.settings.playerCount !== 1 ? 'form.playersSuffix' : 'form.playerSuffix')"
                            inputId="playersStepper" />
                    </div>

                    <div class="hidden md:block">
                        <LabelledSlider
                            v-model="settingsStore.settings.playerCount"
                            :min="2" :max="maxPlayersEnv" />
                    </div>
                </div>

                <div v-for="_, i in settingsStore.settings.playerNames.slice(0, settingsStore.settings.playerCount)">
                    <div class="flex mb-2">
                        <NameInput
                            v-model="settingsStore.settings.playerNames[i]"
                            class="flex-grow-1"
                            :placeholder="t('form.name')" />

                        <Button
                            tabindex="-1"
                            class="ml-2"
                            icon="pi pi-trash"
                            severity="danger"
                            :disabled="settingsStore.settings.playerCount <= 2"
                            @click="() => settingsStore.deletePlayer(i)" />
                    </div>
                </div>
            </div>

            <div v-if="uiStore.flyerFormSection === FlyerFormSection.Settings">
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
                            v-model="settingsStore.settings.specification.raceTo"
                            :min="1" :max="maxRaceEnv"
                            :prefix="t('matchLengthModel.racesToPrefix')" />
                    </div>

                    <div v-else-if="isKnockout && isVariableMatchLength">
                        <div v-for="r, i of roundNames" class="p-fluid mb-2">
                            <label :for="'raceToRoundStepper' + i" class="font-bold">
                                {{ r }}
                            </label>

                            <Stepper
                                :inputId="'raceToRoundStepper' + i"
                                v-model="settingsStore.settings.raceToPerRound[i]"
                                :min="1" :max="maxRaceEnv"
                                :prefix="t('matchLengthModel.racesToPrefix')" />
                        </div>
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
                                localise
                                :label="t('format.format')"
                                v-model="settingsStore.settings.specification.format"
                                :options="settingsStore.formatList" />
                        </div>
                    </div>

                    <div class="col-12 md:col-6 p-0 p-fluid">
                        <div class="md:ml-1">
                            <LabelledDropdown
                                localise
                                :label="t('rules.rules')"
                                v-model="settingsStore.settings.specification.ruleSet"
                                :options="settingsStore.ruleSetList" />
                        </div>
                    </div>

                    <div v-if="isRoundRobin"
                        class="col-12 md:col-6 p-0 p-fluid">
                        <div class="md:mr-1">
                            <LabelledDropdown
                                localise
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
                        Advanced
                    </p>

                    <LabelledCheckbox
                        v-if="isKnockout"
                        label="Randomly draw all rounds"
                        v-model="settingsStore.settings.specification.randomlyDrawAllRounds" />

                    <LabelledCheckbox
                        v-if="isRoundRobin"
                        label="Require completed rounds"
                        v-model="settingsStore.settings.specification.requireCompletedRounds" />

                    <LabelledCheckbox
                        v-if="isRoundRobin"
                        label="Allow early finish"
                        v-model="settingsStore.settings.specification.allowEarlyFinish" />

                    <LabelledCheckbox
                        v-if="isRoundRobin"
                        label="Allow draws"
                        v-model="settingsStore.settings.specification.allowDraws" />
                </div>
            </div>

            <div v-if="uiStore.flyerFormSection === FlyerFormSection.Tables">
                <div class="p-fluid mb-2">
                    <label for="tablesStepper" class="font-bold">
                        {{ t("form.tables") }}
                    </label>

                    <div v-if="!isWinnerStaysOn">
                        <!-- MEDIUM: show/hide these via useScreenSizes() -->
                        <div class="md:hidden mb-2">
                            <Stepper
                                v-model="settingsStore.settings.tableCount"
                                :min="1" :max="maxTableCount"
                                :suffix="t(settingsStore.settings.tableCount !== 1 ? 'form.tablesSuffix' : 'form.tableSuffix')"
                                inputId="tablesStepper" />
                        </div>

                        <div class="hidden md:block">
                            <LabelledSlider
                                v-model="settingsStore.settings.tableCount"
                                :min="1" :max="maxTableCount" />
                        </div>
                    </div>

                    <Message class="m-0 mb-2" severity="info" :closable="false">
                        <span v-if="isWinnerStaysOn">{{ t("form.winnerStaysOnTableLimit") }}</span>
                        <span v-else>{{ t("form.tableLimit", { maxTableCount }) }}</span>
                    </Message>
                </div>

                <div class="p-fluid mb-2">
                    <div v-for="_, i in settingsStore.settings.tables.slice(0, settingsStore.settings.tableCount)">
                        <div class="flex" :class="i > 0 && 'mt-1 pt-1 border-none border-top-1 border-dashed border-gray-200'">
                            <div class="flex-grow-1">
                                <TableInput
                                    compact
                                    v-model:name="settingsStore.settings.tables[i].name"
                                    v-model:cost="settingsStore.settings.tables[i].costPerHour" />
                            </div>

                            <Button
                                tabindex="-1"
                                class="ml-2"
                                icon="pi pi-trash"
                                severity="danger"
                                :disabled="settingsStore.settings.tableCount <= 1"
                                @click="() => settingsStore.deleteTable(i)" />
                        </div>
                    </div>
                </div>

                <div class="flex align-items-center justify-content-between border-top-1 border-gray-200">
                    <span>
                        {{ t("form.estimatedCost") }}
                    </span>

                    <div class="ml-2">
                        <p class="m-0 text-center font-bold text-xl">
                            {{ n(estimatedCost, "currency") }}
                        </p>
                    </div>
                </div>

                <Message class="m-0" severity="info" :closable="false">
                    {{ t("form.costSplitEvenly") }}
                </Message>
            </div>

            <div v-if="uiStore.flyerFormSection === FlyerFormSection.Prizes">
                <LabelledCheckbox
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
                        localise
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
        </div>
    </div>
</template>

<style>
.p-inputnumber-button.p-disabled {
    pointer-events: auto;
}

.p-tabmenu .p-tabmenu-nav {
    background: var(--color-background);
    transition: background-color 0.5s;
}

.p-tabmenu .p-tabmenu-nav .p-tabmenuitem {
    background: var(--color-background);
    flex: 1;
    justify-content: center;
    transition: background-color 0.5s;
}

.p-tabmenu .p-tabmenu-nav .p-tabmenuitem .p-menuitem-link {
    background: var(--color-background);
    color: var(--color-text);
    justify-content: center;
    transition: background-color 0.5s;
}

.p-tabmenu .p-tabmenu-nav .p-tabmenuitem .p-menuitem-link .p-menuitem-icon {
    margin-right: 0;
    font-size: 1.5rem;
    padding-bottom: 0.125rem;
}

.p-selectbutton .p-button .pi, .p-selectbutton .p-button .p-button-label {
    font-size: 12px;
}
</style>
