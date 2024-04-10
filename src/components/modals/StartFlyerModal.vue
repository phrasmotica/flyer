<script setup lang="ts">
import { useI18n } from "vue-i18n"
import { useToggle } from "@vueuse/core"

import ConfirmModal from "./ConfirmModal.vue"
import LabelledCheckbox from "../setup/LabelledCheckbox.vue"

import { useSettings } from "@/composables/useSettings"
import { useTweaks } from "@/composables/useTweaks"

import { useSettingsStore } from "@/stores/settings"

const { t } = useI18n()

const visible = defineModel<boolean>("visible", {
    default: false,
})

const emit = defineEmits<{
    confirm: []
    hide: []
}>()

const settingsStore = useSettingsStore()

const { selectOnFocus } = useTweaks()

const {
    settings,
} = useSettings(settingsStore.settings)

const [entryFeesPaid, setEntryFeesPaid] = useToggle()

const hide = () => {
    emit("hide")

    setEntryFeesPaid(false)
}
</script>

<template>
    <ConfirmModal
        v-model:visible="visible"
        :header="t('form.startFlyer')"
        :message="t('form.pleaseEnterName')"
        :confirmLabel="t('common.start')"
        :confirmDisabled="settings.specification.name.length <= 0 || (settings.specification.entryFeeRequired && !entryFeesPaid)"
        :cancelLabel="t('common.goBack')"
        @confirm="emit('confirm')"
        @hide="hide">
        <div class="p-fluid mb-2">
            <InputText
                ref="nameInput"
                :placeholder="t('form.flyerName')"
                v-model="settings.specification.name"
                @focus="selectOnFocus" />
        </div>

        <div class="p-fluid mb-2">
            <LabelledCheckbox
                v-if="settings.specification.entryFeeRequired"
                v-model="entryFeesPaid"
                :label="t('form.entryFeesPaidConfirm')" />
        </div>
    </ConfirmModal>
</template>
