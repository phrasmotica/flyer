<script setup lang="ts">
import { computed } from "vue"
import { useI18n } from "vue-i18n"
import { v4 as uuidv4 } from "uuid"

const value = defineModel<string | number>()

const props = defineProps<{
    label: string
    options: { name: string, value: (string | number), disabled?: boolean }[]
    disabled?: boolean
}>()

const { t } = useI18n()

const id = "labelled-dropdown-" + uuidv4()

const localisedOptions = computed(() => props.options.map(o => ({
    ...o,
    name: t(o.name),
})))
</script>

<template>
    <div class="p-fluid mb-2">
        <label
            :for="id"
            class="font-bold"
            :class="[props.disabled && 'text-color-secondary']">
            {{ props.label }}
        </label>

        <Dropdown
            :inputId="id"
            v-model="value"
            :options="localisedOptions"
            placeholder="-"
            optionLabel="name"
            optionValue="value"
            optionDisabled="disabled"
            :disabled="props.disabled || localisedOptions.length <= 0" />
    </div>
</template>
