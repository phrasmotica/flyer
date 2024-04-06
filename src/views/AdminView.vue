<script setup lang="ts">
import { computed } from "vue"
import { useRouter } from "vue-router"
import { useTitle } from "@vueuse/core"

import PageTemplate from "@/components/PageTemplate.vue"

import { useRouting } from "@/composables/useRouting"
import { useScreenSizes } from "@/composables/useScreenSizes"
import { useTimedRef } from "@/composables/useTimedRef"

useTitle("Flyer - Admin")

const routing = useRouting(useRouter())

const {
    isSmallScreen,
} = useScreenSizes()

const {
    value: isCleared,
} = useTimedRef(2000, false)

const clearButtonLabel = computed(() => isCleared.value ? "Done!" : "Clear local storage")

const clearLocalStorage = () => {
    localStorage.clear()

    isCleared.value = true
}
</script>

<template>
    <PageTemplate>
        <template #header>
            <div class="flex flex-grow-1 align-items-center justify-content-between">
                <h1>Admin</h1>
            </div>
        </template>

        <template #content>
            <div class="p-fluid">
                <Button
                    :label="clearButtonLabel"
                    :disabled="isCleared"
                    severity="danger"
                    @click="clearLocalStorage" />
            </div>
        </template>

        <template v-if="!isSmallScreen" #sidebar>
            <div class="p-fluid">
                <Button
                    label="Go back"
                    severity="info"
                    @click="routing.toSetup" />
            </div>
        </template>

        <template v-if="isSmallScreen" #buttons>
            <Button
                label="Go back"
                severity="info"
                @click="routing.toSetup" />
        </template>
    </PageTemplate>
</template>
