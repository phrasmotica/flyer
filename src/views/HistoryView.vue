<script setup lang="ts">
import { useRouter } from "vue-router"

import FlyerHistory from "../components/FlyerHistory.vue"
import PageTemplate from "../components/PageTemplate.vue"

const router = useRouter()

const newFlyer = () => {
    router.push({
        name: "setup",
    })
}
</script>

<template>
    <PageTemplate>
        <template #content>
            <h1 class="border-bottom-1">Past Flyers</h1>

            <FlyerHistory />
        </template>

        <template #buttons>
            <Button label="New flyer" severity="info" @click="newFlyer" />
        </template>
    </PageTemplate>
</template>
