<script setup lang="ts">
import { useToggle } from "@vueuse/core"

import ConfirmModal from "./ConfirmModal.vue"
import LabelledCheckbox from "../LabelledCheckbox.vue"

import { useSettings } from "../../composables/useSettings"
import { useTweaks } from "../../composables/useTweaks"

import { useSettingsStore } from "../../stores/settings"

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
        header="Start Flyer"
        message="Please enter a name for the flyer:"
        confirmLabel="Start"
        :confirmDisabled="settings.specification.name.length <= 0 || (settings.specification.entryFeeRequired && !entryFeesPaid)"
        cancelLabel="Go back"
        @confirm="emit('confirm')"
        @hide="hide">
        <div class="p-fluid mb-2">
            <InputText
                ref="nameInput"
                placeholder="Flyer name"
                v-model="settings.specification.name"
                @focus="selectOnFocus" />
        </div>

        <div class="p-fluid mb-2">
            <LabelledCheckbox
                v-if="settings.specification.entryFeeRequired"
                v-model="entryFeesPaid"
                label="Entry fees paid?" />
        </div>
    </ConfirmModal>
</template>