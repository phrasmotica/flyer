<script setup lang="ts">
import { computed, ref } from "vue"
import { useRouter } from "vue-router"
import { useClipboard } from "@vueuse/core"

import FlyerHistory from "../components/FlyerHistory.vue"
import PageTemplate from "../components/PageTemplate.vue"

import { useFlyerHistoryStore } from "../stores/flyerHistory"

const { copy } = useClipboard()

const flyerHistory = useFlyerHistoryStore()

const router = useRouter()

const isExported = ref(false)

const exportButtonLabel = computed(() => isExported.value ? "Data copied to clipboard!" : "Export data")

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
                :label="exportButtonLabel"
                :disabled="isExported"
                severity="primary"
                @click="exportPastFlyers" />
        </template>
    </PageTemplate>
</template>
