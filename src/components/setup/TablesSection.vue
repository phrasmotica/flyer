<script setup lang="ts">
import { computed } from "vue"
import { useI18n } from "vue-i18n"

import LabelledSlider from "./LabelledSlider.vue"
import Stepper from "./Stepper.vue"
import TableInput from "./TableInput.vue"

import { useSpecification } from "@/composables/usePhaseSettings"
import { useScreenSizes } from "@/composables/useScreenSizes"
import { useSettings } from "@/composables/useSettings"

import { useSettingsStore } from "@/stores/settings"

const { n, t } = useI18n()

const {
    isSmallScreen,
} = useScreenSizes()

const settingsStore = useSettingsStore()

const {
    estimatedCost,
} = useSettings(settingsStore.settings)

const {
    isWinnerStaysOn,
} = useSpecification(settingsStore.settings.specification)

const maxTableCount = computed(() => {
    if (isWinnerStaysOn.value) {
        return 1
    }

    return Math.floor(settingsStore.settings.playerCount / 2)
})
</script>

<template>
    <div>
        <div class="p-fluid mb-2">
            <label for="tablesStepper" class="font-bold">
                {{ t("form.tables") }}
            </label>

            <div v-if="!isWinnerStaysOn">
                <div v-if="isSmallScreen" class="mb-2">
                    <Stepper
                        v-model="settingsStore.settings.tableCount"
                        :min="1" :max="maxTableCount"
                        :suffix="t(settingsStore.settings.tableCount !== 1 ? 'form.tablesSuffix' : 'form.tableSuffix')"
                        inputId="tablesStepper" />
                </div>

                <div v-else>
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
</template>
