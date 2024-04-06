<script setup lang="ts">
import { useFlyer } from "@/composables/useFlyer"

import { useFlyerStore } from "@/stores/flyer"

const flyerStore = useFlyerStore()

const {
    incompleteCount,
} = useFlyer(flyerStore.flyer)
</script>

<template>
    <Message severity="warn" :closable="false">
        <em>{{ incompleteCount }} player(s) have incomplete results!</em>
    </Message>
</template>
