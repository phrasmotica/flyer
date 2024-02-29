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
            <div class="flex align-items-center justify-content-between border-bottom-1">
                <h1>Past Flyers</h1>

                <Button icon="pi pi-plus" severity="info" @click="newFlyer" />
            </div>

            <FlyerHistory />
        </template>
    </PageTemplate>
</template>
