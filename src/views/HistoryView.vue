<script setup lang="ts">
import { computed, ref } from "vue"
import { useRouter } from "vue-router"
import { useClipboard, useToggle } from "@vueuse/core"

import ConfirmModal from "../components/ConfirmModal.vue"
import FlyerHistory from "../components/FlyerHistory.vue"
import PageTemplate from "../components/PageTemplate.vue"

import type { Flyer } from "../data/Flyer"

import { useFlyerHistoryStore } from "../stores/flyerHistory"

const {
    copy,
} = useClipboard()

const flyerHistory = useFlyerHistoryStore()

const router = useRouter()

const importText = ref("")
const [showImportModal, setShowImportModal] = useToggle(false)

const isImported = ref(false)
const failedToImport = ref(false)

const isExported = ref(false)

const importButtonLabel = computed(() => {
    if (failedToImport.value) {
        return "Failed to import from clipboard!"
    }

    return isImported.value ? "Data imported from clipboard!" : "Import data"
})

const exportButtonLabel = computed(() => isExported.value ? "Data copied to clipboard!" : "Export data")

const importPastFlyers = () => {
    try {
        const data = <Flyer[]>JSON.parse(importText.value)
        flyerHistory.importFlyers(data)

        isImported.value = true
        importText.value = ""
        setShowImportModal(false)

        setTimeout(() => {
            isImported.value = false
        }, 2000)
    }
    catch (e) {
        console.error(e)

        failedToImport.value = true

        setTimeout(() => {
            failedToImport.value = false
        }, 2000)
    }
}

const exportPastFlyers = () => {
    const data = JSON.stringify(flyerHistory.pastFlyers)
    copy(data)

    isExported.value = true

    setTimeout(() => {
        isExported.value = false
    }, 2000)
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
            <div class="flex align-items-center justify-content-between border-bottom-1">
                <h1>Past Flyers</h1>

                <Button icon="pi pi-plus" severity="info" @click="newFlyer" />
            </div>
        </template>

        <template #content>
            <FlyerHistory />
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

        <template #buttons>
            <Button
                class="mb-2"
                :label="importButtonLabel"
                :disabled="failedToImport || isImported"
                severity="primary"
                @click="() => setShowImportModal(true)" />

            <Button
                :label="exportButtonLabel"
                :disabled="isExported"
                severity="primary"
                @click="exportPastFlyers" />
        </template>
    </PageTemplate>
</template>
