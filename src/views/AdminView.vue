<script setup lang="ts">
import { computed, ref } from "vue"
import { useRouter } from "vue-router"

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
    <main class="flex flex-column justify-content-between">
        <div class="content overflow-y-auto p-5">
            <h1 class="border-bottom-1">Admin</h1>

            <div class="p-fluid mt-2">
                <Button
                    :label="clearButtonLabel"
                    :disabled="isCleared"
                    severity="danger"
                    @click="clearLocalStorage" />
            </div>
        </div>

        <div class="nav-buttons p-fluid p-3">
            <Button
                class="mb-2"
                label="Go back"
                severity="info"
                @click="backToSetup" />
        </div>
    </main>
</template>

<style scoped>
@media screen and (max-width: 767px) {
    main {
        width: 100%;
    }
}

@media screen and (min-width: 768px) {
    main {
        width: 600px;
    }
}
</style>
