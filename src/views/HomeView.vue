<script setup lang="ts">
import { ref } from "vue"
import { useRouter } from "vue-router"
import { useFocus } from "@vueuse/core"
import { useToast } from "primevue/usetoast"

import FlyerForm from "../components/FlyerForm.vue"
import FlyerFormSection from "../components/FlyerFormSection.vue"
import FlyerSummary from "../components/FlyerSummary.vue"
import PageTemplate from "../components/PageTemplate.vue"
import StartFlyerModal from "../components/StartFlyerModal.vue"

import { useScreenSizes } from "../composables/useScreenSizes"
import { useSettings } from "../composables/useSettings"

import { useFlyerStore } from "../stores/flyer"
import { useSettingsStore } from "../stores/settings"
import { useUiStore } from "../stores/ui"

const router = useRouter()

const flyerStore = useFlyerStore()
const settingsStore = useSettingsStore()
const uiStore = useUiStore()

const {
    isSmallScreen,
} = useScreenSizes()

const toast = useToast()

const {
    settings,
} = useSettings(settingsStore.settings)

const nameInput = ref()
const showModal = ref(false)

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
                        @click="viewPastFlyers" />

                    <Button v-if="!isSmallScreen"
                        icon="pi pi-arrow-right-arrow-left"
                        severity="help"
                        @click="uiStore.toggleSidebarPosition" />
                </div>
            </div>
        </template>

        <template #content>
            <FlyerForm />
        </template>

        <template v-if="!isSmallScreen" #sidebar>
            <FlyerSummary @confirmStart="confirmStart" />
        </template>

        <template #modals>
            <StartFlyerModal
                v-model:visible="showModal"
                @confirm="start"
                @hide="hideModal" />
        </template>

        <template v-if="isSmallScreen" #buttons>
            <FlyerFormSection hidden noUnderline header="Summary">
                <FlyerSummary overflow @confirmStart="confirmStart" />
            </FlyerFormSection>
        </template>
    </PageTemplate>
</template>
