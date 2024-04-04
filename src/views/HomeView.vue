<script setup lang="ts">
import { ref } from "vue"
import { useRouter } from "vue-router"
import { useFocus, useToggle } from "@vueuse/core"
import { useToast } from "primevue/usetoast"

import FlyerForm from "../components/FlyerForm.vue"
import FlyerFormSection from "../components/FlyerFormSection.vue"
import FlyerSummary from "../components/FlyerSummary.vue"
import PageTemplate from "../components/PageTemplate.vue"
import SidebarLayoutToggleButton from "../components/SidebarLayoutToggleButton.vue"
import StartFlyerModal from "../components/modals/StartFlyerModal.vue"

import { useRouting } from "../composables/useRouting"
import { useScreenSizes } from "../composables/useScreenSizes"
import { useSettings } from "../composables/useSettings"

import { useFlyerStore } from "../stores/flyer"
import { useSettingsStore } from "../stores/settings"

const routing = useRouting(useRouter())

const flyerStore = useFlyerStore()
const settingsStore = useSettingsStore()

const {
    isSmallScreen,
} = useScreenSizes()

const toast = useToast()

const {
    settings,
} = useSettings(settingsStore.settings)

const nameInput = ref()
const [showModal, setShowModal] = useToggle()

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

    setShowModal(false)

    routing.toPlay()
}
</script>

<template>
    <PageTemplate>
        <template #header>
            <div class="flex align-items-center justify-content-between">
                <h1>New Flyer</h1>

                <div class="flex gap-1">
                    <Button
                        icon="pi pi-history"
                        severity="info"
                        @click="routing.toHistory" />

                    <SidebarLayoutToggleButton v-if="!isSmallScreen" />
                </div>
            </div>
        </template>

        <template #content>
            <FlyerForm />
        </template>

        <template v-if="!isSmallScreen" #sidebar>
            <FlyerSummary
                sidebar
                @confirmStart="() => setShowModal(true)" />
        </template>

        <template #modals>
            <StartFlyerModal
                v-model:visible="showModal"
                @confirm="start"
                @hide="() => setShowModal(false)" />
        </template>

        <template v-if="isSmallScreen" #buttons>
            <FlyerFormSection hidden noUnderline header="Summary">
                <FlyerSummary
                    overflow
                    @confirmStart="() => setShowModal(true)" />
            </FlyerFormSection>
        </template>
    </PageTemplate>
</template>
