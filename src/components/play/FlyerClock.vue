<script setup lang="ts">
import { onMounted, onUnmounted } from "vue"
import { useToggle } from "@vueuse/core"

import Clock from "./Clock.vue"
import Price from "./Price.vue"

import { useFlyer } from "@/composables/useFlyer"
import { usePhase } from "@/composables/usePhase"
import { usePhaseTiming } from "@/composables/usePhaseTiming"

import { useFlyerStore } from "@/stores/flyer"

const flyerStore = useFlyerStore()

const {
    currentPhase,
} = useFlyer(flyerStore.flyer)

const {
    totalCost,
} = usePhase(currentPhase.value)

const {
    isInProgress,
    estimatedDurationMinutes,
    clockDisplay,
    pauseClock,
    resumeClock,
} = usePhaseTiming(currentPhase.value)

const [showPrice, toggleShowPrice] = useToggle()

onMounted(() => {
    if (isInProgress.value) {
        resumeClock()
    }
})

onUnmounted(() => {
    pauseClock()
})
</script>

<template>
    <div class="cursor-pointer" @click="() => toggleShowPrice()">
        <Price v-if="showPrice" :amount="totalCost" />

        <Clock v-else
            :elapsedMilliseconds="clockDisplay"
            :warnAfterMilliseconds="estimatedDurationMinutes * 60000" />
    </div>
</template>
