<script setup lang="ts">
import { computed, ref, watch } from "vue"

const props = defineProps<{
    elapsedSeconds: number
}>()

const elapsedSeconds = ref(props.elapsedSeconds)

watch(props, () => {
    elapsedSeconds.value = props.elapsedSeconds
})

const pad = (n: number) => n.toString().padStart(2, "0")

const clockText = computed(() => {
    const hours = Math.floor(elapsedSeconds.value / 3600)
    const r = elapsedSeconds.value % 3600
    const minutes = Math.floor(r / 60)
    const seconds = r % 60

    return `${pad(hours)}:${pad(minutes)}:${pad(seconds)}`
})
</script>

<template>
    <p class="text-center font-bold text-xl">{{ clockText }}</p>
</template>
