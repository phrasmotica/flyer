<script setup lang="ts">
import { useTitle, useToggle } from "@vueuse/core"
import { useToast } from "primevue/usetoast"
import { useI18n } from "vue-i18n"
import { useRouter } from "vue-router"

import PageTemplate from "@/components/PageTemplate.vue"
import AccountButton from "@/components/account/AccountButton.vue"
import LoginButton from "@/components/account/LoginButton.vue"
import StartFlyerModal from "@/components/modals/StartFlyerModal.vue"
import FlyerForm from "@/components/setup/FlyerForm.vue"
import FlyerFormSection from "@/components/setup/FlyerFormSection.vue"
import FlyerSummary from "@/components/setup/FlyerSummary.vue"

import { useAuth } from "@/composables/useAuth"
import { useEnv } from "@/composables/useEnv"
import { useRouting } from "@/composables/useRouting"
import { useScreenSizes } from "@/composables/useScreenSizes"
import { useSettings } from "@/composables/useSettings"

import { PlayViewSection } from "@/data/UiSettings"

import AdminButton from "@/components/account/AdminButton.vue"
import { useFlyerStore } from "@/stores/flyer"
import { useSettingsStore } from "@/stores/settings"
import { useUiStore } from "@/stores/ui"

const { t } = useI18n()

useTitle("Flyer - " + t('form.newFlyer'))

const routing = useRouting(useRouter())

const {
    oidcEnabled,
} = useEnv()

const {
    isAuthenticated,
} = useAuth()

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
const [showModal, setShowModal] = useToggle()

const start = () => {
    try {
        flyerStore.start(settings.value)
    }
    catch (e) {
        console.error(e)

        toast.add({
            severity: 'error',
            summary: t('common.error'),
            detail: t('form.failedToStart'),
            life: 3000,
        })

        return
    }

    uiStore.settings.currentSection = PlayViewSection.Fixtures
    uiStore.settings.pinnedSection = PlayViewSection.Info

    setShowModal(false)

    routing.toPlay()
}
</script>

<template>
    <PageTemplate>
        <template #header>
            {{ t('form.newFlyer') }}
        </template>

        <template #headerButtons>
            <AdminButton v-if="!oidcEnabled"
                :hideText="true" />

            <Button
                icon="pi pi-history"
                severity="info"
                @click="routing.toHistory" />

            <div v-if="oidcEnabled">
                <AccountButton v-if="isAuthenticated"
                    :hideText="isSmallScreen"
                    :showUsernameInDropdown="isSmallScreen" />

                <LoginButton v-else />
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
            <FlyerFormSection hidden noUnderline :header="t('form.summary')">
                <FlyerSummary
                    overflow
                    @confirmStart="() => setShowModal(true)" />
            </FlyerFormSection>
        </template>
    </PageTemplate>
</template>
