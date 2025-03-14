<script setup lang="ts">
import { computed } from "vue"
import { useI18n } from "vue-i18n"

import WinnerWinnings from "./WinnerWinnings.vue"
import WinningsList from "./WinningsList.vue"

import { useFlyer } from "@/composables/useFlyer"
import { usePlayers } from "@/composables/usePlayers"

import { useFlyerStore } from "@/stores/flyer"

const { t } = useI18n()

const flyerStore = useFlyerStore()

const {
    mainPhase,
    overallStandings,
    overallMoneyRecipients,
} = useFlyer(flyerStore.flyer)

const {
    getPlayer,
} = usePlayers(mainPhase.value)

const winner = computed(() => getPlayer(overallStandings.value[0].playerId))
</script>

<template>
    <div>
        <div class="m-0 text-center text-xl">
            <WinnerWinnings
                :winner="winner!"
                :winnings="overallMoneyRecipients[0]" />
        </div>

        <div v-if="overallMoneyRecipients.length > 1" class="border-top-1 mt-1 pt-1">
            <WinningsList
                :header="t('results.otherPrizeMoney')"
                :winnings="overallMoneyRecipients.slice(1)" />
        </div>
    </div>
</template>
