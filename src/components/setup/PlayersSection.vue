<script setup lang="ts">
import { useI18n } from "vue-i18n"

import LabelledSlider from "./LabelledSlider.vue"
import NameInput from "./NameInput.vue"
import Stepper from "./Stepper.vue"

import { useSettingsStore } from "@/stores/settings"

const maxPlayersEnv = Number(import.meta.env.VITE_MAX_PLAYERS)

const { t } = useI18n()

const settingsStore = useSettingsStore()
</script>

<template>
    <div>
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
</template>
