<script setup lang="ts">
import { computed } from "vue"
import { useI18n } from "vue-i18n"

import WinningsList from "./WinningsList.vue"

import { useQueryParams } from "@/composables/useQueryParams"
import { useFlyer } from "@/composables/useFlyer"

import { useFlyerStore } from "@/stores/flyer"

const { n, t } = useI18n()

const flyerStore = useFlyerStore()

const {
    overallMoneyRecipients,
} = useFlyer(flyerStore.flyer)

const {
    isHistoric,
} = useQueryParams()

const message = computed(() => {
    const key = isHistoric.value ? 'results.winningsMessageHistoric' : 'results.winningsMessage'
    return t(key, { name: overallMoneyRecipients.value[0].player.name })
})
</script>

<template>
    <div>
        <p v-if="overallMoneyRecipients.length > 0" class="m-0 text-center text-xl">
            <span>{{ message }}</span>

            <span class="font-bold" :style="{color: overallMoneyRecipients[0].colour,}">
                {{ n(overallMoneyRecipients[0].winnings, "currency") }}
            </span>
        </p>

        <div v-if="overallMoneyRecipients.length > 1" class="border-top-1 mt-1 pt-1">
            <WinningsList
                :header="t('results.otherPrizeMoney')"
                :winnings="overallMoneyRecipients.slice(1)" />
        </div>
    </div>
</template>
