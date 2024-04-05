<script setup lang="ts">
import { ref } from "vue"
import { useRouter } from "vue-router"
import { useClipboard, useTitle, useToggle } from "@vueuse/core"

import DarkModeToggleButton from "../components/DarkModeToggleButton.vue"
import FlyerHistory from "../components/FlyerHistory.vue"
import HistoryButtons from "../components/HistoryButtons.vue"
import ImportPastFlyersModal from "../components/modals/ImportPastFlyersModal.vue"
import PageTemplate from "../components/PageTemplate.vue"
import SidebarLayoutToggleButton from "../components/SidebarLayoutToggleButton.vue"

import { useRouting } from "../composables/useRouting"
import { useScreenSizes } from "../composables/useScreenSizes"
import { useTimedRef } from "../composables/useTimedRef"

import type { Flyer } from "../data/Flyer"

import { useFlyerStore } from "../stores/flyer"
import { useFlyerHistoryStore } from "../stores/flyerHistory"

useTitle("Flyer - Past Flyers")

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
            <div class="flex align-items-center justify-content-between">
                <h1>Past Flyers</h1>

                <div class="flex gap-1">
                    <Button icon="pi pi-plus" severity="info" @click="routing.toSetup" />

                    <SidebarLayoutToggleButton v-if="!isSmallScreen" />

                    <DarkModeToggleButton v-if="!isSmallScreen" />
                </div>
            </div>
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
