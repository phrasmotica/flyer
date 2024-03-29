<script setup lang="ts">
import { computed, ref, watch } from "vue"
import { useI18n } from "vue-i18n"

const props = defineProps<{
    elapsedSeconds: number
    warnAfterSeconds?: number
    large?: boolean
}>()

const { d } = useI18n()

const elapsedSeconds = ref(props.elapsedSeconds)

watch(props, () => {
    elapsedSeconds.value = props.elapsedSeconds
})

const shouldWarn = computed(() => !!props.warnAfterSeconds && elapsedSeconds.value > props.warnAfterSeconds)

const clockText = computed(() => {
    // multiply by 1000 since d() requires milliseconds
    return d(elapsedSeconds.value * 1000, "clock")
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
