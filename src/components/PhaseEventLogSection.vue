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
        <div v-for="e of eventLog">
            {{ d(e.timestamp, "long") }}: {{ e.message }}
        </div>
    </div>
</template>
