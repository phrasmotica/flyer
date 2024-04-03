<script setup lang="ts">
import { useI18n } from "vue-i18n"

import { useFlyer } from "../composables/useFlyer"
import { usePhase } from "../composables/usePhase"

import { useFlyerStore } from "../stores/flyer"

const { d } = useI18n()

const flyerStore = useFlyerStore()

const {
    currentPhase,
} = useFlyer(flyerStore.flyer)

const {
    eventLog,
} = usePhase(currentPhase.value)
</script>

<template>
    <div>
        <div v-for="e, i of eventLog" :class="i > 0 && 'mt-1 border-top-1 pt-1'">
            {{ d(e.timestamp, "long") }}: {{ e.message }}
        </div>
    </div>
</template>
