<script setup lang="ts">
import RoundSection from "./RoundSection.vue"

import { useFlyer } from "../composables/useFlyer"
import { usePhase } from "../composables/usePhase"
import { useStringToggle } from "../composables/useStringToggle"

import type { Fixture } from "../data/Fixture"

import { useFlyerStore } from "../stores/flyer"

const emit = defineEmits<{
    showFixtureModal: [fixture: Fixture]
}>()

const flyerStore = useFlyerStore()

const {
    currentPhase,
} = useFlyer(flyerStore.flyer)

const {
    rounds,
} = usePhase(currentPhase.value)

const [highlightedFixtureId, highlight] = useStringToggle("")
</script>

<template>
    <div v-for="r in rounds" class="my-1 px-2 border-1 border-round-md">
        <RoundSection
            :round="r"
            :highlightedFixtureId="highlightedFixtureId"
            @showModal="f => emit('showFixtureModal', f)"
            @highlight="highlight" />
    </div>
</template>
