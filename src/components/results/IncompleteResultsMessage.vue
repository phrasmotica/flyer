<script setup lang="ts">
import { useI18n } from "vue-i18n"

import { useFlyer } from "@/composables/useFlyer"

import { useFlyerStore } from "@/stores/flyer"

const { t } = useI18n()

const flyerStore = useFlyerStore()

const {
    incompleteCount,
} = useFlyer(flyerStore.flyer)
</script>

<template>
    <Message severity="warn" :closable="false">
        {{ t('results.incompleteResultsMessage', incompleteCount) }}
    </Message>
</template>
