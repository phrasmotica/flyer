<script setup lang="ts">
import { useFlyer } from "@/composables/useFlyer"
import { useKnockout } from "@/composables/useKnockout"

import { useFlyerStore } from "@/stores/flyer"

const flyerStore = useFlyerStore()

const {
    currentPhase,
} = useFlyer(flyerStore.flyer)

const {
    bracketData,
} = useKnockout(currentPhase.value)
</script>

<template>
    <OrganizationChart :value="bracketData">
        <template #default="{ node }">
            <span>{{ node.label }}</span>
        </template>
    </OrganizationChart>
</template>
