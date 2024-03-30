<script setup lang="ts">
import { onUpdated, ref } from "vue"
import { useI18n } from "vue-i18n"
import type { MenuItem } from "primevue/menuitem"

import CurrencyStepper from "./CurrencyStepper.vue"
import LabelledCheckbox from "./LabelledCheckbox.vue"
import LabelledDropdown from "./LabelledDropdown.vue"
import LabelledSlider from "./LabelledSlider.vue"
import NameInput from "./NameInput.vue"
import PrizePotSummary from "./PrizePotSummary.vue"
import Stepper from "./Stepper.vue"
import TableInput from "./TableInput.vue"

import { useSettings } from "../composables/useSettings"
import { useTweaks } from "../composables/useTweaks"

import { useSettingsStore } from "../stores/settings"

enum Section {
    Players,
    Settings,
    Tables,
    Prizes,
}

const maxPlayersEnv = Number(import.meta.env.VITE_MAX_PLAYERS)
const maxRaceEnv = Number(import.meta.env.VITE_MAX_RACE)

const settingsStore = useSettingsStore()

const {
    formatSummary,
    estimatedCost,
    roundNames,
    isFixedMatchLength,
    isVariableMatchLength,
    isKnockout,
    isRoundRobin,
    isWinnerStaysOn,
    maxTableCount,
} = useSettings(settingsStore.settings)

const { n } = useI18n()

const { blurNumberInputs } = useTweaks()

const section = ref(Section.Players)

const items = ref<MenuItem[]>([
    {
        icon: 'pi pi-user',
        command: _ => section.value = Section.Players,
    },
    {
        icon: 'pi pi-book',
        command: _ => section.value = Section.Settings,
    },
    {
        icon: 'pi pi-building',
        command: _ => section.value = Section.Tables,
    },
    {
        icon: 'pi pi-pound',
        command: _ => section.value = Section.Prizes,
    },
])

onUpdated(() => {
    blurNumberInputs("form-content")
})
</script>

<template>
    <TabMenu class="mb-2" :model="items" />

    <!-- LOW: only make the form content overflow with a scroll bar, not the tab menu also -->
    <div id="form-content">
        <div v-if="section === Section.Players">
            <div class="p-fluid mb-2 md:hidden">
                <Stepper
                    v-model="settingsStore.settings.playerCount"
                    :min="2" :max="maxPlayersEnv"
                    suffix=" players" />
            </div>

            <div class="mt-2 hidden md:block">
                <LabelledSlider
                    v-model="settingsStore.settings.playerCount"
                    :min="2" :max="maxPlayersEnv" />
            </div>

            <div v-for="_, i in settingsStore.settings.playerNames.slice(0, settingsStore.settings.playerCount)">
                <div class="flex mb-2">
                    <NameInput
                        v-model="settingsStore.settings.playerNames[i]"
                        class="flex-grow-1"
                        placeholder="Name" />

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

        <div v-if="section === Section.Settings">
            <div class="p-fluid mb-1">
                <SelectButton
                    id="matchLengthModelSelect"
                    v-model="settingsStore.settings.matchLengthModel"
                    :disabled="!isKnockout"
                    :options="settingsStore.matchLengthModelList"
                    optionLabel="summary"
                    optionValue="value"
                    aria-labelledby="basic" />
            </div>

            <div class="mb-2 px-2 border-1 border-gray-200 border-round-md">
                <div v-if="isRoundRobin || (isKnockout && isFixedMatchLength)" class="p-fluid mb-2">
                    <label for="raceToStepper" class="font-bold">
                        All rounds
                    </label>

                    <Stepper
                        inputId="raceToStepper"
                        v-model="settingsStore.settings.raceTo"
                        :min="1" :max="maxRaceEnv"
                        prefix="Races to " />
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
                            prefix="Races to " />
                    </div>
                </div>

                <div v-if="isWinnerStaysOn" class="p-fluid mb-2">
                    <label for="winsRequiredStepper" class="font-bold">
                        Wins required
                    </label>

                    <Stepper
                        inputId="winsRequiredStepper"
                        v-model="settingsStore.settings.winsRequired"
                        :min="settingsStore.settings.playerCount - 1" :max="maxRaceEnv"
                        :suffix="settingsStore.settings.winsRequired > 1 ? ' wins' : ' win'" />

                    <p class="m-0 text-xs md:text-base font-italic text-color-secondary">
                        Must be at least one fewer than the player count ({{ settingsStore.settings.playerCount - 1 }}).
                    </p>
                </div>
            </div>

            <div class="grid m-0">
                <div class="col-12 md:col-6 mb-0 p-0 p-fluid">
                    <div class="md:mr-1">
                        <LabelledDropdown
                            label="Format"
                            v-model="settingsStore.settings.format"
                            :options="settingsStore.formatList" />
                    </div>
                </div>

                <div class="col-12 md:col-6 p-0 p-fluid">
                    <div class="md:ml-1">
                        <LabelledDropdown
                            label="Rules"
                            v-model="settingsStore.settings.ruleSet"
                            :options="settingsStore.ruleSetList" />
                    </div>
                </div>

                <div v-if="isRoundRobin"
                    class="col-12 md:col-6 p-0 p-fluid">
                    <div class="md:mr-1">
                        <LabelledDropdown
                            label="Tie Breaker"
                            v-model="settingsStore.settings.tieBreaker"
                            :options="settingsStore.tieBreakerList" />
                    </div>
                </div>

                <div v-if="isRoundRobin"
                    class="col-12 md:col-6 p-0 p-fluid">
                    <div class="md:ml-1 mb-2">
                        <label for="stageCountStepper" class="font-bold">
                            Number of stages
                        </label>

                        <Stepper
                            inputId="stageCountStepper"
                            v-model="settingsStore.settings.stageCount"
                            :min="1" :max="4"
                            :suffix="settingsStore.settings.stageCount > 1 ? ' stages' : ' stage'" />

                        <p class="m-0 text-xs md:text-base font-italic text-color-secondary">
                            This is the number of times each player will play the others.
                        </p>
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
                    v-model="settingsStore.settings.randomlyDrawAllRounds" />

                <LabelledCheckbox
                    v-if="isRoundRobin"
                    label="Require completed rounds"
                    v-model="settingsStore.settings.requireCompletedRounds" />

                <LabelledCheckbox
                    v-if="isRoundRobin"
                    label="Allow early finish"
                    v-model="settingsStore.settings.allowEarlyFinish" />

                <LabelledCheckbox
                    v-if="isRoundRobin"
                    label="Allow draws"
                    v-model="settingsStore.settings.allowDraws" />
            </div>
        </div>

        <div v-if="section === Section.Tables">
            <div class="p-fluid mb-2">
                <label for="tablesStepper" class="font-bold">
                    Tables
                </label>

                <div class="md:hidden">
                    <Stepper
                        v-model="settingsStore.settings.tableCount"
                        :min="1" :max="maxTableCount"
                        :suffix="settingsStore.settings.tableCount > 1 ? ' tables' : ' table'"
                        inputId="tablesStepper"
                        :disabled="isWinnerStaysOn" />
                </div>

                <p class="m-0 text-xs md:text-base font-italic text-color-secondary">
                    <span v-if="isWinnerStaysOn">
                        {{ formatSummary }} can only use one table.
                    </span>
                    <span v-else>
                        Cannot be more than half the number of players rounded down ({{ maxTableCount }}).
                    </span>
                </p>

                <div class="hidden md:block">
                    <LabelledSlider
                        v-model="settingsStore.settings.tableCount"
                        :min="1" :max="maxTableCount" />
                </div>
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
                    Estimated cost
                </span>

                <div class="ml-2">
                    <p class="m-0 text-center font-bold text-xl">
                        {{ n(estimatedCost, "currency") }}
                    </p>
                </div>
            </div>

            <div class="font-italic text-xs md:text-base text-color-secondary">
                This will be split evenly between ALL players.
            </div>
        </div>

        <div v-if="section === Section.Prizes">
            <LabelledCheckbox
                label="Require entry fee"
                v-model="settingsStore.settings.entryFeeRequired" />

            <div v-if="settingsStore.settings.entryFeeRequired">
                <div class="p-fluid mb-2">
                    <label for="entryFeeStepper" class="font-bold">
                        Entry fee
                    </label>

                    <CurrencyStepper
                        inputId="entryFeeStepper"
                        v-model="settingsStore.settings.entryFee"
                        :min="5" :max="20" :step="5"
                        suffix=" entry fee" />
                </div>

                <LabelledDropdown
                    label="Money split"
                    v-model="settingsStore.settings.moneySplit"
                    :options="settingsStore.moneySplitOptions"
                    :disabled="!settingsStore.settings.entryFeeRequired" />

                <div class="mt-2 border-top-1 border-gray-200">
                    <PrizePotSummary :settings="settingsStore.settings" />
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

.p-tabmenu .p-tabmenu-nav .p-tabmenuitem.p-highlight .p-menuitem-link {
    color: hsla(160, 100%, 37%, 1);
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
