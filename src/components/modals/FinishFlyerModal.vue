<script setup lang="ts">
import { useI18n } from "vue-i18n"

import ConfirmModal from "./ConfirmModal.vue"

const { t } = useI18n()

const visible = defineModel<boolean>("visible", {
    default: false,
})

const emit = defineEmits<{
    confirm: []
    hide: []
}>()
</script>

<template>
    <ConfirmModal
        v-model:visible="visible"
        :header="t('play.finishFlyer')"
        :message="t('play.finishFlyerAreYouSure')"
        @confirm="emit('confirm')"
        @hide="emit('hide')" />
</template>
