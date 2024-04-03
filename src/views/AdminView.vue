<script setup lang="ts">
import { computed, ref } from "vue"
import { useRouter } from "vue-router"

import PageTemplate from "../components/PageTemplate.vue"

const router = useRouter()

const isCleared = ref(false)

const backToSetup = () => {
    router.push({
        name: "setup",
    })
}

const clearButtonLabel = computed(() => isCleared.value ? "Done!" : "Clear local storage")

const clearLocalStorage = () => {
    localStorage.clear()
    isCleared.value = true

    setTimeout(() => {
        isCleared.value = false
    }, 2000)
}
</script>

<template>
    <PageTemplate>
        <template #header>
            <h1 class="border-bottom-1">Admin</h1>
        </template>

        <template #content>
            <div class="p-fluid mt-2">
                <Button
                    :label="clearButtonLabel"
                    :disabled="isCleared"
                    severity="danger"
                    @click="clearLocalStorage" />
            </div>
        </template>

        <template #buttons>
            <Button
                class="mb-2"
                label="Go back"
                severity="info"
                @click="backToSetup" />
        </template>
    </PageTemplate>
</template>
