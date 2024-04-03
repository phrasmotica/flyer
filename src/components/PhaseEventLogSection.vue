<script setup lang="ts">
import { useI18n } from "vue-i18n"

import { useEventLog } from "../composables/useEventLog"
import { useFlyer } from "../composables/useFlyer"

import { useFlyerStore } from "../stores/flyer"

const { d } = useI18n()

const flyerStore = useFlyerStore()

const {
    currentPhase,
} = useFlyer(flyerStore.flyer)

const {
    sortedDefaultEventLog,
} = useEventLog(currentPhase.value)
</script>

<template>
    <div>
        <div v-for="e, i of sortedDefaultEventLog" :class="i > 0 && 'mt-1 border-top-1 pt-1'">
            <span class="text-sm">
                {{ d(e.timestamp, "long") }}: {{ e.message }}
            </span>
        </div>
    </div>
</template>
