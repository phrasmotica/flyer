<script setup lang="ts">
import { computed } from "vue"
import { useI18n } from "vue-i18n"
import { useRouter } from "vue-router"

import { useRouting } from "@/composables/useRouting"

const props = defineProps<{
    hideText?: boolean,
}>()

const { t } = useI18n()

const routing = useRouting(useRouter())

const buttonText = computed(() => props.hideText ? "" : t("common.viewAdminPage"))
</script>

<template>
    <Button
        class="text-left"
        :label="buttonText"
        icon="pi pi-lock"
        iconPos="right"
        severity="danger"
        @click="routing.toAdmin" />
</template>
