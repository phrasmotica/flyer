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
    <main class="flex flex-column justify-content-between">
        <div class="content overflow-y-auto p-5">
            <h1 class="border-bottom-1">Past Flyers</h1>

            <FlyerHistory />
        </div>

        <div class="nav-buttons p-fluid p-3">
            <Button label="New flyer" severity="info" @click="newFlyer" />
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
