<script setup lang="ts">
import { computed, onUpdated, ref, watch } from "vue"
import type { MenuItem } from "primevue/menuitem"

import LabelledCheckbox from "./LabelledCheckbox.vue"
import LabelledDropdown from "./LabelledDropdown.vue"
import LabelledSlider from "./LabelledSlider.vue"
import PlayerNameInput from "./PlayerNameInput.vue"
import PrizePotSummary from "./PrizePotSummary.vue"

import { Format, MoneySplit, RuleSet } from "../data/FlyerSettings"

import { useSettingsStore } from "../stores/settings"

enum Section {
    Players,
    Settings,
    Prizes,
}

const maxPlayersEnv = Number(import.meta.env.VITE_MAX_PLAYERS)
const maxRaceEnv = Number(import.meta.env.VITE_MAX_RACE)

const settingsStore = useSettingsStore()

const section = ref(Section.Players)

watch(() => settingsStore.settings.playerCount, () => {
    if (settingsStore.settings.tableCount > Math.floor(settingsStore.settings.playerCount / 2)) {
        settingsStore.settings.tableCount = Math.floor(settingsStore.settings.playerCount / 2)
    }
})

watch(() => settingsStore.settings.format, () => {
    if (settingsStore.settings.format === Format.Knockout) {
        settingsStore.settings.requireCompletedRounds = true
        settingsStore.settings.allowEarlyFinish = false
        settingsStore.settings.allowDraws = false
    }

    if (settingsStore.settings.format === Format.RoundRobin) {
        settingsStore.settings.randomlyDrawAllRounds = false
        settingsStore.settings.requireCompletedRounds = false
    }
})

const items = ref<MenuItem[]>([
    {
        icon: 'pi pi-user',
        command: _ => section.value = Section.Players,
    },
    {
        icon: 'pi pi-cog',
        command: _ => section.value = Section.Settings,
    },
    {
        icon: 'pi pi-pound',
        command: _ => section.value = Section.Prizes,
    },
]);

const isKnockout = computed(() => settingsStore.settings.format === Format.Knockout)

onUpdated(() => {
    const formSection = document.getElementById("form-content")
    if (formSection) {
        const buttons = formSection.getElementsByClassName("p-inputnumber-button")
        for (const b of buttons) {
            // hack to stop InputNumber elements from focusing after pressing their buttons.
            // Important for mobile UX
            b.addEventListener("mouseup", () => {
                (<any>document.activeElement)?.blur()
            })
        }
    }
})
</script>

<template>
    <TabMenu class="mb-2" :model="items" />

    <!-- TODO: only make the form content overflow with a scroll bar, not the tab menu also -->
    <div id="form-content">
        <div v-if="section === Section.Players">
            <div class="p-fluid mb-2 md:hidden">
                <InputNumber
                    v-model="settingsStore.settings.playerCount"
                    showButtons buttonLayout="horizontal"
                    :min="2" :max="maxPlayersEnv"
                    suffix=" players"
                    inputClass="text-center font-bold">
                    <template #incrementbuttonicon>
                        <span class="pi pi-plus" />
                    </template>
                    <template #decrementbuttonicon>
                        <span class="pi pi-minus" />
                    </template>
                </InputNumber>
            </div>

            <div class="mt-2 hidden md:block">
                <LabelledSlider
                    v-model="settingsStore.settings.playerCount"
                    :min="2" :max="maxPlayersEnv" />
            </div>

            <div v-for="p, i in settingsStore.settings.playerNames.slice(0, settingsStore.settings.playerCount)">
                <div class="flex mb-2">
                    <PlayerNameInput
                        class="flex-grow-1"
                        :placeholder="'Player ' + (i + 1)"
                        :name="p"
                        @setName="n => settingsStore.setName(i, n)" />

                    <Button
                        class="ml-2"
                        icon="pi pi-trash"
                        severity="danger"
                        :disabled="settingsStore.settings.playerCount <= 2 || i >= settingsStore.settings.playerCount"
                        @click="() => settingsStore.deleteName(i)" />
                </div>
            </div>
        </div>

        <div v-if="section === Section.Settings">
            <div class="p-fluid mb-2">
                <InputNumber
                    v-model="settingsStore.settings.raceTo"
                    showButtons buttonLayout="horizontal"
                    :min="1" :max="maxRaceEnv"
                    prefix="Races to "
                    :inputStyle="{ 'text-align': 'center', 'font-weight': 'bold' }">
                    <template #incrementbuttonicon>
                        <span class="pi pi-plus" />
                    </template>
                    <template #decrementbuttonicon>
                        <span class="pi pi-minus" />
                    </template>
                </InputNumber>
            </div>

            <div class="p-fluid mb-2">
                <InputNumber
                    v-model="settingsStore.settings.tableCount"
                    showButtons buttonLayout="horizontal"
                    :min="1" :max="Math.floor(settingsStore.settings.playerCount / 2)"
                    suffix=" table(s)"
                    :inputStyle="{ 'text-align': 'center', 'font-weight': 'bold' }">
                    <template #incrementbuttonicon>
                        <span class="pi pi-plus" />
                    </template>
                    <template #decrementbuttonicon>
                        <span class="pi pi-minus" />
                    </template>
                </InputNumber>
            </div>

            <div class="grid m-0">
                <div class="col-12 md:col-6 mb-2 md:mb-0 p-0 p-fluid">
                    <div class="md:mr-1">
                        <LabelledDropdown
                            label="Format"
                            v-model="settingsStore.settings.format"
                            :options="[Format.Knockout, Format.RoundRobin]" />
                    </div>
                </div>

                <div class="col-12 md:col-6 p-0 p-fluid">
                    <div class="md:ml-1">
                        <LabelledDropdown
                            label="Rules"
                            v-model="settingsStore.settings.ruleSet"
                            :options="[RuleSet.Blackball, RuleSet.International]" />
                    </div>
                </div>
            </div>

            <p class="m-0 font-bold">
                Advanced
            </p>

            <LabelledCheckbox
                v-if="isKnockout"
                label="Randomly draw all rounds"
                v-model="settingsStore.settings.randomlyDrawAllRounds" />

            <LabelledCheckbox
                v-if="!isKnockout"
                label="Require completed rounds"
                v-model="settingsStore.settings.requireCompletedRounds" />

            <LabelledCheckbox
                v-if="!isKnockout"
                label="Allow early finish"
                v-model="settingsStore.settings.allowEarlyFinish" />

            <LabelledCheckbox
                v-if="!isKnockout"
                label="Allow draws"
                v-model="settingsStore.settings.allowDraws" />
        </div>

        <div v-if="section === Section.Prizes">
            <LabelledCheckbox
                label="Require entry fee"
                v-model="settingsStore.settings.entryFeeRequired" />

            <div v-if="settingsStore.settings.entryFeeRequired">
                <div class="p-fluid mb-2">
                    <InputNumber
                        v-model="settingsStore.settings.entryFee"
                        showButtons buttonLayout="horizontal"
                        :min="5" :max="20" :step="5"
                        mode="currency" currency="GBP" locale="en-GB"
                        suffix=" entry fee"
                        inputClass="text-center font-bold"
                        :disabled="!settingsStore.settings.entryFeeRequired">
                        <template #incrementbuttonicon>
                            <span class="pi pi-plus" />
                        </template>
                        <template #decrementbuttonicon>
                            <span class="pi pi-minus" />
                        </template>
                    </InputNumber>
                </div>

                <LabelledDropdown
                    label="Money split"
                    v-model="settingsStore.settings.moneySplit"
                    :options="[MoneySplit.WinnerTakesAll, MoneySplit.SeventyThirty, MoneySplit.SixtyTwentyFiveFifteen]"
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

.p-tabmenu .p-tabmenu-nav .p-tabmenuitem {
    flex: 1;
    justify-content: center;
}

.p-tabmenu .p-tabmenu-nav .p-tabmenuitem .p-menuitem-link {
    color: var(--color-text);
    justify-content: center;
}

.p-tabmenu .p-tabmenu-nav .p-tabmenuitem.p-highlight .p-menuitem-link {
    color: hsla(160, 100%, 37%, 1);
}

.p-tabmenu .p-tabmenu-nav .p-tabmenuitem .p-menuitem-link .p-menuitem-icon {
    margin-right: 0;
    font-size: 1.5rem;
    padding-bottom: 0.125rem;
}
</style>
