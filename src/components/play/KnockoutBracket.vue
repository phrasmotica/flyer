<script setup lang="ts">
import { useFlyer } from "@/composables/useFlyer"

import { useFlyerStore } from "@/stores/flyer"
import type { OrganizationChartNode } from "primevue/organizationchart"
import { ref } from "vue"

const flyerStore = useFlyerStore()

const {
    currentPhase,
} = useFlyer(flyerStore.flyer)

const treeData = ref<OrganizationChartNode>({
    key: "final-0",
    label: "Final",
    children: [],
})
</script>

<template>
    <OrganizationChart :value="treeData">
        <template #default="{ node }">
            <span>{{ node.label }}</span>
        </template>
    </OrganizationChart>
</template>
