<script setup lang="ts">
import FixtureCard from "./FixtureCard.vue"

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
            <div style="width: 12vw;">
                <FixtureCard
                    vertical
                    static
                    :fixture="node.data"
                    highlightedFixtureId=""
                    :showComment="false" />
            </div>
        </template>
    </OrganizationChart>
</template>
