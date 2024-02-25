<script setup lang="ts">
import { useRouter } from "vue-router"

const router = useRouter()

const backToSetup = () => {
    router.push({
        name: "setup",
    })
}

const clearLocalStorage = () => {
    localStorage.clear()
}
</script>

<template>
    <main>
        <div class="sticky bottom-0 bg-white p-fluid pt-2">
            <Button class="mb-2" label="Clear local storage" severity="danger" @click="clearLocalStorage" />

            <Button class="mb-2" label="Go back" severity="secondary" @click="backToSetup" />
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
