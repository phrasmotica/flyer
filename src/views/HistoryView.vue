<script setup lang="ts">
import { computed, ref } from "vue"
import { useRouter } from "vue-router"
import { useClipboard } from "@vueuse/core"

import FlyerHistory from "../components/FlyerHistory.vue"
import PageTemplate from "../components/PageTemplate.vue"

import type { Flyer } from "../data/Flyer"

import { useFlyerHistoryStore } from "../stores/flyerHistory"

const { copy, text: clipboardText } = useClipboard()

const flyerHistory = useFlyerHistoryStore()

const router = useRouter()

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
        const data = <Flyer[]>JSON.parse(clipboardText.value)
        flyerHistory.importFlyers(data)

        isImported.value = true

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
        <template #content>
            <div class="flex align-items-center justify-content-between border-bottom-1">
                <h1>Past Flyers</h1>

                <Button icon="pi pi-plus" severity="info" @click="newFlyer" />
            </div>

            <FlyerHistory />
        </template>

        <template #buttons>
            <Button
                class="mb-2"
                :label="importButtonLabel"
                :disabled="failedToImport || isImported"
                severity="primary"
                @click="importPastFlyers" />

            <Button
                :label="exportButtonLabel"
                :disabled="isExported"
                severity="primary"
                @click="exportPastFlyers" />
        </template>
    </PageTemplate>
</template>
