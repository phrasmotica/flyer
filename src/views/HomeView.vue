<script setup lang="ts">
import { useI18n } from "vue-i18n"
import { useRouter } from "vue-router"
import { useTitle, useToggle } from "@vueuse/core"
import { useToast } from "primevue/usetoast"

import FlyerForm from "@/components/setup/FlyerForm.vue"
import FlyerFormSection from "@/components/setup/FlyerFormSection.vue"
import FlyerSummary from "@/components/setup/FlyerSummary.vue"
import PageTemplate from "@/components/PageTemplate.vue"
import StartFlyerModal from "@/components/modals/StartFlyerModal.vue"

import { useRouting } from "@/composables/useRouting"
import { useScreenSizes } from "@/composables/useScreenSizes"
import { useSettings } from "@/composables/useSettings"

import { useFlyerStore } from "@/stores/flyer"
import { useSettingsStore } from "@/stores/settings"

const { t } = useI18n()

useTitle("Flyer - " + t('form.newFlyer'))

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
const [showModal, setShowModal] = useToggle()

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
            summary: t('common.error'),
            detail: t('form.failedToStart'),
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
            <div class="flex flex-grow-1 align-items-center justify-content-between">
                <h1>{{ t('form.newFlyer') }}</h1>
            </div>
        </template>

        <template #headerButtons>
            <Button
                icon="pi pi-history"
                severity="info"
                @click="routing.toHistory" />
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
            <FlyerFormSection hidden noUnderline :header="t('form.summary')">
                <FlyerSummary
                    overflow
                    @confirmStart="() => setShowModal(true)" />
            </FlyerFormSection>
        </template>
    </PageTemplate>
</template>
