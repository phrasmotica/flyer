<script setup lang="ts">
import { computed, ref } from "vue"
import { useRouter } from "vue-router"
import { useClipboard, useToggle } from "@vueuse/core"

import ConfirmModal from "../components/ConfirmModal.vue"
import FlyerHistory from "../components/FlyerHistory.vue"
import HistoryButtons from "../components/HistoryButtons.vue"
import PageTemplate from "../components/PageTemplate.vue"

import { useScreenSizes } from "../composables/useScreenSizes"
import { useTimedRef } from "../composables/useTimedRef"

import type { Flyer } from "../data/Flyer"

import { useFlyerHistoryStore } from "../stores/flyerHistory"

const {
    copy,
} = useClipboard()

const flyerHistory = useFlyerHistoryStore()

const {
    isSmallScreen,
} = useScreenSizes()

const router = useRouter()

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

const importPastFlyers = () => {
    try {
        const data = <Flyer[]>JSON.parse(importText.value)
        flyerHistory.importFlyers(data)

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
    const data = JSON.stringify(flyerHistory.pastFlyers)
    copy(data)

    isExported.value = true
}

const newFlyer = () => {
    router.push({
        name: "setup",
    })
}
</script>

<template>
    <PageTemplate>
        <template #header>
            <div class="flex align-items-center justify-content-between">
                <h1>Past Flyers</h1>

                <Button icon="pi pi-plus" severity="info" @click="newFlyer" />
            </div>
        </template>

        <template #content>
            <FlyerHistory />
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
            <ConfirmModal
                :visible="showImportModal"
                header="Import data"
                message="Please paste flyer data here:"
                confirmLabel="Import"
                :confirmDisabled="false"
                cancelLabel="Cancel"
                @confirm="importPastFlyers"
                @hide="() => setShowImportModal(false)">
                <div class="p-fluid">
                    <Textarea v-model="importText" />
                </div>
            </ConfirmModal>
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
