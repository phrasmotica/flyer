<script setup lang="ts">
import { computed, ref, watch } from "vue"

const props = defineProps<{
    elapsedSeconds: number
    warnAfterSeconds?: number
    large?: boolean
}>()

const elapsedSeconds = ref(props.elapsedSeconds)

watch(props, () => {
    elapsedSeconds.value = props.elapsedSeconds
})

// MEDIUM: encapsulate this inside a Clock object, which should be exported
// by a useClock() hook, which should take an object with startTime and
// finishTime properties
const shouldWarn = computed(() => !!props.warnAfterSeconds && elapsedSeconds.value > props.warnAfterSeconds)

const pad = (n: number) => n.toString().padStart(2, "0")

const clockText = computed(() => {
    // MEDIUM: use vue-i18n for this time formatting
    const hours = Math.floor(elapsedSeconds.value / 3600)
    const r = elapsedSeconds.value % 3600
    const minutes = Math.floor(r / 60)
    const seconds = r % 60

    return `${pad(hours)}:${pad(minutes)}:${pad(seconds)}`
})
</script>

<template>
    <p
        class="m-0 text-center font-bold text-xl"
        :class="[
            props.large && 'text-3xl',
            shouldWarn && 'text-red-500',
        ]">
        {{ clockText }}
    </p>
</template>
