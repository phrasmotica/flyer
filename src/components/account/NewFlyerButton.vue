<script setup lang="ts">
import { useI18n } from "vue-i18n"
import { useRouter } from "vue-router"

import { useRouting } from "@/composables/useRouting"

const { t } = useI18n()

const routing = useRouting(useRouter())
</script>

<template>
    <Button
        class="text-left"
        :label="t('common.createNewFlyer')"
        icon="pi pi-plus"
        iconPos="right"
        severity="info"
        @click="routing.toSetup" />
</template>
