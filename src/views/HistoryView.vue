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
    </main>

    <div class="sticky bottom-0 bg-colour p-fluid w-full pt-2 px-5">
        <Button class="mb-5" label="New flyer" severity="info" @click="newFlyer" />
    </div>

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
