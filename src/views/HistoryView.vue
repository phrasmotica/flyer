<script setup lang="ts">
import { useRouter } from "vue-router"

import FlyerHistory from "../components/FlyerHistory.vue"

const router = useRouter()

const newFlyer = () => {
    router.push({
        name: "setup",
    })
}
</script>

<template>
    <main>
        <h1 class="border-bottom-1">Past Flyers</h1>

        <FlyerHistory />

        <div class="sticky bottom-0 bg-white p-fluid pt-2">
            <Button class="mb-4" label="New flyer" severity="info" @click="newFlyer" />
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
