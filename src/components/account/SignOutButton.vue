<script setup lang="ts">
import Button from "primevue/button"
import { computed, ref } from "vue"
import { useI18n } from "vue-i18n"

import { useAuth } from "@/composables/useAuth"

const props = defineProps<{
    hideText?: boolean,
}>()

const { t } = useI18n()

const {
    signOut,
} = useAuth()

const loading = ref(false)

const signOutButtonText = computed(() => props.hideText ? "" : t("auth.signout"))

const doSignOut = () => {
    loading.value = true

    signOut()
}
</script>

<template>
    <Button
        class="text-left"
        icon="pi pi-sign-out"
        iconPos="right"
        severity="danger"
        :label="signOutButtonText"
        @click.prevent="doSignOut"
        :loading="loading" />
</template>
