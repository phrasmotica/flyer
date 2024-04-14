<script setup lang="ts">
import { computed } from "vue"

import { useFixtureList } from "@/composables/useFixtureList"
import { useFlyer } from "@/composables/useFlyer"

import { useFlyerStore } from "@/stores/flyer"
import MatchText from "./MatchText.vue"

const props = defineProps<{
    playerId: string
}>()

const flyerStore = useFlyerStore()

const {
    mainPhase,
} = useFlyer(flyerStore.flyer)

const {
    getFixtures,
} = useFixtureList(mainPhase.value)

const fixtures = computed(() => getFixtures(props.playerId))
</script>

<template>
    <div>
        <ul class="m-0">
            <li v-for="f in fixtures" class="text-sm">
                <MatchText :playerId="props.playerId" :fixture="f" />
            </li>
        </ul>
    </div>
</template>
