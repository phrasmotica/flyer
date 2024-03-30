<script setup lang="ts">
import { computed, ref, watch } from "vue"
import { useI18n } from "vue-i18n"

const props = defineProps<{
    elapsedMilliseconds: number
    warnAfterMilliseconds?: number
    large?: boolean
}>()

const { d } = useI18n()

const elapsedSeconds = ref(props.elapsedMilliseconds)

watch(props, () => {
    elapsedSeconds.value = props.elapsedMilliseconds
})

const shouldWarn = computed(() => !!props.warnAfterMilliseconds && elapsedSeconds.value > props.warnAfterMilliseconds)

const clockText = computed(() => d(elapsedSeconds.value, "clock"))
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
