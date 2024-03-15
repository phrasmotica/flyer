<script setup lang="ts">
import { ref } from "vue"

import FixtureModal from "./FixtureModal.vue"
import RoundSection from "./RoundSection.vue"

import { useFlyer } from "../composables/useFlyer"
import { useStringToggle } from "../composables/useStringToggle"

import type { Fixture } from "../data/Fixture"

import { useFlyerStore, usePlayOffStore } from "../stores/flyer"

const props = defineProps<{
    isPlayOff?: boolean
}>()

const defaultFlyerStore = useFlyerStore()
const playOffStore = usePlayOffStore()

const flyerStore = props.isPlayOff ? playOffStore : defaultFlyerStore

const {
    rounds,
} = useFlyer(flyerStore.flyer?.phases[0] || null)

const selectedFixture = ref<Fixture>()
const [highlightedFixtureId, highlight] = useStringToggle("")
const showModal = ref(false)

const selectForRecording = (f: Fixture) => {
    selectedFixture.value = f
    showModal.value = true
}

const hideModal = () => {
    showModal.value = false
}
</script>

<template>
    <div v-for="r in rounds" class="my-1 px-2 border-1 border-round-md">
        <RoundSection
            :round="r"
            :highlightedFixtureId="highlightedFixtureId"
            @showModal="selectForRecording"
            @highlight="highlight" />
    </div>

    <FixtureModal
        :visible="showModal"
        :fixture="selectedFixture"
        :isPlayOff="props.isPlayOff"
        @hide="hideModal" />
</template>
