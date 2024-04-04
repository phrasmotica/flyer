<script setup lang="ts">
import { useToggle } from "@vueuse/core"

import Clock from "../components/Clock.vue"
import Price from "../components/Price.vue"

import { useFlyer } from "../composables/useFlyer"
import { usePhase } from "../composables/usePhase"

import { useFlyerStore } from "../stores/flyer"
import { onMounted, onUnmounted } from "vue"

const flyerStore = useFlyerStore()

const {
    currentPhase,
} = useFlyer(flyerStore.flyer)

const {
    isInProgress,
    clockDisplay,
    totalCost,
    estimatedDurationMinutes,
    pauseClock,
    resumeClock,
} = usePhase(currentPhase.value)

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
