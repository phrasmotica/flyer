<script setup lang="ts">
import { computed, ref, watch } from "vue"
import { useI18n } from "vue-i18n"

const props = defineProps<{
    amount: number
    large?: boolean
}>()

const { n } = useI18n()

const amount = ref(props.amount)

watch(props, () => {
    amount.value = props.amount
})

const priceText = computed(() => n(amount.value, "currency"))
</script>

<template>
    <p class="m-0 text-center font-bold text-xl" :class="[props.large && 'text-3xl']">
        {{ priceText }}
    </p>
</template>
