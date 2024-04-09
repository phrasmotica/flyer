<script setup lang="ts">
import { useI18n } from "vue-i18n"

import CurrencyStepper from "./CurrencyStepper.vue"
import NameInput from "./NameInput.vue"

const newTableName = defineModel<string>("name")
const newTableCost = defineModel<number>("cost")

const props = defineProps<{
    compact?: boolean
}>()

const { t } = useI18n()
</script>

<template>
    <NameInput
        :class="!props.compact && 'mb-2'"
        v-model="newTableName"
        :placeholder="t('form.tableName')" />

    <CurrencyStepper
        :class="props.compact ? 'mt-1' : 'mb-2'"
        inputId="newTableCostPerHourStepper"
        v-model="newTableCost"
        :suffix="t('form.perHourSuffix')" />
</template>
