<script setup lang="ts">
import { computed } from "vue"
import { useI18n } from "vue-i18n"

import { useQueryParams } from "@/composables/useQueryParams"

import type { Winnings } from "@/data/Winnings"

const { n, t } = useI18n()

const props = defineProps<{
    winnings: Winnings
}>()

const {
    isHistoric,
} = useQueryParams()

const message = computed(() => {
    const key = isHistoric.value ? 'results.winningsMessageHistoric' : 'results.winningsMessage'
    return t(key, { name: props.winnings.player.name })
})
</script>

<template>
    <div>
        <span>{{ message }}</span>

        <span class="font-bold" :style="{color: props.winnings.colour,}">
            {{ n(props.winnings.amount, "currency") }}
        </span>
    </div>
</template>
