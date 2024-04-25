<script setup lang="ts">
import type { OrganizationChartNode } from "primevue/organizationchart"
import { computed } from "vue"
import { useI18n } from "vue-i18n"

import { useFlyer } from "@/composables/useFlyer"
import { useKnockout } from "@/composables/useKnockout"
import { usePlayers } from "@/composables/usePlayers"

import type { Fixture, Score } from "@/data/Fixture"

import { useFlyerStore } from "@/stores/flyer"

const { t } = useI18n()

const flyerStore = useFlyerStore()

const {
    currentPhase,
} = useFlyer(flyerStore.flyer)

const {
    getPlayerName,
} = usePlayers(currentPhase.value)

const {
    bracketData,
} = useKnockout(currentPhase.value)

const localisedBracketData = computed(() => localiseNode(bracketData.value))

const localiseNode = (node: OrganizationChartNode): OrganizationChartNode => {
    const fixture: Fixture = node.data
    const children = node.children || []

    return {
        key: node.key,
        label: getPlayersDescription(fixture.scores),
        children: children.map(localiseNode)
    }
}

// HIGH: deduplicate this - see FixtureModal.vue
const getPlayersDescription = (scores: Score[]) => {
    return scores.map(s => {
        if (s.isBye) {
            return t("player.byeIndicator")
        }

        return getPlayerName(s.playerId) || t("player.unknownIndicator")
    }).join(t("fixture.playerJoiner"))
}
</script>

<template>
    <OrganizationChart :value="localisedBracketData">
        <template #default="{ node }">
            <span class="text-xs">
                {{ node.label }}
            </span>
        </template>
    </OrganizationChart>
</template>
