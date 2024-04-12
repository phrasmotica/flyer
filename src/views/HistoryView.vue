<script setup lang="ts">
import { ref } from "vue"
import { useI18n } from "vue-i18n"
import { useRouter } from "vue-router"
import { useClipboard, useTitle, useToggle } from "@vueuse/core"

import FlyerHistory from "@/components/history/FlyerHistory.vue"
import HistoryButtons from "@/components/history/HistoryButtons.vue"
import ImportPastFlyersModal from "@/components/modals/ImportPastFlyersModal.vue"
import PageTemplate from "@/components/PageTemplate.vue"

import { useRouting } from "@/composables/useRouting"
import { useScreenSizes } from "@/composables/useScreenSizes"
import { useTimedRef } from "@/composables/useTimedRef"

import type { Flyer } from "@/data/Flyer"

import { useFlyerStore } from "@/stores/flyer"
import { useFlyerHistoryStore } from "@/stores/flyerHistory"

const { t } = useI18n()

useTitle("Flyer - " + t('history.pastFlyers'))

const {
    copy,
} = useClipboard()

const flyerStore = useFlyerStore()
const flyerHistoryStore = useFlyerHistoryStore()

const {
    isSmallScreen,
} = useScreenSizes()

const routing = useRouting(useRouter())

const importText = ref("")
const [showImportModal, setShowImportModal] = useToggle(false)

const {
    value: isImported,
} = useTimedRef(2000, false)

const {
    value: failedToImport,
} = useTimedRef(2000, false)

const {
    value: isExported,
} = useTimedRef(2000, false)

const viewFlyer = (f: Flyer) => {
    flyerStore.setFlyer(f)

    routing.toPlayHistoric()
}

const importPastFlyers = () => {
    try {
        const data = <Flyer[]>JSON.parse(importText.value)
        flyerHistoryStore.importFlyers(data)

        isImported.value = true
        importText.value = ""
        setShowImportModal(false)
    }
    catch (e) {
        console.error(e)

        failedToImport.value = true
    }
}

const exportPastFlyers = () => {
    const data = JSON.stringify(flyerHistoryStore.pastFlyers)
    copy(data)

    isExported.value = true
}
</script>

<template>
    <PageTemplate>
        <template #header>
            {{ t('history.pastFlyers') }}
        </template>

        <template #headerButtons>
            <Button icon="pi pi-plus" severity="info" @click="routing.toSetup" />
        </template>

        <template #content>
            <FlyerHistory @viewFlyer="viewFlyer" />
        </template>

        <template v-if="!isSmallScreen" #sidebar>
            <HistoryButtons
                :isImported="isImported"
                :failedToImport="failedToImport"
                :isExported="isExported"
                @exportPastFlyers="exportPastFlyers"
                @showImportModal="() => setShowImportModal(true)" />
        </template>

        <template #modals>
            <ImportPastFlyersModal
                v-model:text="importText"
                v-model:visible="showImportModal"
                @hide="() => setShowImportModal(false)"
                @importPastFlyers="importPastFlyers" />
        </template>

        <template v-if="isSmallScreen" #buttons>
            <HistoryButtons
                :isImported="isImported"
                :failedToImport="failedToImport"
                :isExported="isExported"
                @exportPastFlyers="exportPastFlyers"
                @showImportModal="() => setShowImportModal(true)" />
        </template>
    </PageTemplate>
</template>
