<script setup lang="ts">
import { ref } from "vue"
import { useRouter } from "vue-router"
import { useFocus } from "@vueuse/core"
import { useToast } from "primevue/usetoast"

import ConfirmModal from "../components/ConfirmModal.vue"
import FlyerForm from "../components/FlyerForm.vue"
import FlyerFormSection from "../components/FlyerFormSection.vue"
import FlyerSummary from "../components/FlyerSummary.vue"
import LabelledCheckbox from "../components/LabelledCheckbox.vue"
import PageTemplate from "../components/PageTemplate.vue"

import { useScreenSizes } from "../composables/useScreenSizes"
import { useSettings } from "../composables/useSettings"
import { useTweaks } from "../composables/useTweaks"

import { useFlyerStore } from "../stores/flyer"
import { useSettingsStore } from "../stores/settings"

const router = useRouter()

const flyerStore = useFlyerStore()
const settingsStore = useSettingsStore()

const {
    isSmallScreen,
} = useScreenSizes()

const toast = useToast()

const { selectOnFocus } = useTweaks()

const {
    settings,
} = useSettings(settingsStore.settings)

const nameInput = ref()
const showModal = ref(false)
const entryFeesPaid = ref(false)

useFocus(nameInput, { initialValue: true })

const start = () => {
    try {
        flyerStore.start(settings.value)
    }
    catch (e) {
        console.error(e)

        // BUG: figure out why this doesn't appear
        toast.add({
            group: "errors",
            severity: 'error',
            summary: 'Error',
            detail: 'Failed to start flyer! Please try again.',
            life: 3000,
        })

        return
    }

    hideModal()

    router.push({
        name: "play",
    })
}

const confirmStart = () => {
    showModal.value = true
}

const viewPastFlyers = () => {
    router.push({
        name: "history",
    })
}

const hideModal = () => {
    showModal.value = false
    entryFeesPaid.value = false
}
</script>

<template>
    <PageTemplate>
        <template #header>
            <div class="flex align-items-center justify-content-between border-bottom-1 mb-2">
                <h1>New Flyer</h1>

                <Button icon="pi pi-history" severity="info" @click="viewPastFlyers" />
            </div>
        </template>

        <template #content>
            <FlyerForm />
        </template>

        <template v-if="!isSmallScreen" #sidebar>
            <FlyerSummary @confirmStart="confirmStart" />
        </template>

        <template #modals>
            <ConfirmModal
                :visible="showModal"
                header="Start Flyer"
                message="Please enter a name for the flyer:"
                confirmLabel="Start"
                :confirmDisabled="settings.specification.name.length <= 0 || (settings.specification.entryFeeRequired && !entryFeesPaid)"
                cancelLabel="Go back"
                @confirm="start"
                @hide="hideModal">
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

        <template v-if="isSmallScreen" #buttons>
            <FlyerFormSection hidden noUnderline header="Summary">
                <FlyerSummary overflow @confirmStart="confirmStart" />
            </FlyerFormSection>
        </template>
    </PageTemplate>
</template>
