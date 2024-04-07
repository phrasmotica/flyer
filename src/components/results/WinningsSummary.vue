<script setup lang="ts">
import { useI18n } from "vue-i18n"

import WinningsList from "./WinningsList.vue"

import { useQueryParams } from "@/composables/useQueryParams"
import { useFlyer } from "@/composables/useFlyer"

import { useFlyerStore } from "@/stores/flyer"

const { n } = useI18n()

const flyerStore = useFlyerStore()

const {
    overallStandings,
    overallMoneyRecipients,
} = useFlyer(flyerStore.flyer)

const {
    isHistoric,
} = useQueryParams()
</script>

<template>
    <div>
        <p v-if="overallStandings[0]" class="m-0 text-center text-xl">
            <span v-if="isHistoric">{{ overallStandings[0].name }} won&nbsp;</span>
            <span v-else>{{ overallStandings[0].name }} wins&nbsp;</span>
            <span v-if="overallMoneyRecipients.length > 0" class="font-bold" :style="{color: overallMoneyRecipients[0].colour,}">
                {{ n(overallMoneyRecipients[0].winnings, "currency") }}
            </span>
        </p>

        <div v-if="overallMoneyRecipients.length > 1" class="border-top-1 mt-1 pt-1">
            <WinningsList
                header="Other prize money:"
                :winnings="overallMoneyRecipients.slice(1)" />
        </div>
    </div>
</template>
