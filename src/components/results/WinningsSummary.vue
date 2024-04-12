<script setup lang="ts">
import { useI18n } from "vue-i18n"

import Winnings from "./Winnings.vue"
import WinningsList from "./WinningsList.vue"

import { useFlyer } from "@/composables/useFlyer"

import { useFlyerStore } from "@/stores/flyer"

const { t } = useI18n()

const flyerStore = useFlyerStore()

const {
    overallMoneyRecipients,
} = useFlyer(flyerStore.flyer)
</script>

<template>
    <div>
        <div v-if="overallMoneyRecipients.length > 0" class="m-0 text-center text-xl">
            <Winnings :winnings="overallMoneyRecipients[0]" />
        </div>

        <div v-if="overallMoneyRecipients.length > 1" class="border-top-1 mt-1 pt-1">
            <WinningsList
                :header="t('results.otherPrizeMoney')"
                :winnings="overallMoneyRecipients.slice(1)" />
        </div>
    </div>
</template>
