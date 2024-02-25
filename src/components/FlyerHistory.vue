<script setup lang="ts">
import { useFlyerHistoryStore } from "../stores/flyerHistory"

const flyerHistoryStore = useFlyerHistoryStore()
</script>

<template>
    <div v-for="f in flyerHistoryStore.pastFlyers"
        class="flex justify-content-between cursor-pointer">
        <div>
            {{ f.settings.name }}
        </div>

        <div>{{ f.startTime }}</div>
    </div>
</template>
