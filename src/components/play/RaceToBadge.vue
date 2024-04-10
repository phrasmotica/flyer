<script setup lang="ts">
import { computed } from "vue"
import { useI18n } from "vue-i18n"

const { t } = useI18n()

const props = defineProps<{
    value: number
    singular?: boolean
}>()

const summary = computed(() => {
    return t(props.singular ? 'races.raceToN' : 'races.racesToN', props.value)
})
</script>

<template>
    <Badge
        :value="summary"
        severity="secondary"/>
</template>
