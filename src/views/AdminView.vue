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
    <main>
        <h1 class="border-bottom-1">Admin</h1>

        <div class="sticky bottom-0 bg-colour p-fluid pt-2">
            <Button
                class="mb-2"
                :label="clearButtonLabel"
                :disabled="isCleared"
                severity="danger"
                @click="clearLocalStorage" />

            <Button
                class="mb-2"
                label="Go back"
                severity="secondary"
                @click="backToSetup" />
        </div>
    </main>

    <footer>
        <a href="https://www.flaticon.com/free-icons/ball-eight" title="ball eight icons">Ball eight icons created by Boris farias - Flaticon</a>
    </footer>
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
