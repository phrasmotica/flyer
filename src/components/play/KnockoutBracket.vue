<script setup lang="ts">
import type { OrganizationChartNode } from "primevue/organizationchart"
import { computed } from "vue"
import { useI18n } from "vue-i18n"

import { useFixtureList } from "@/composables/useFixtureList"
import { useFlyer } from "@/composables/useFlyer"
import { useKnockout } from "@/composables/useKnockout"
import { usePlayers } from "@/composables/usePlayers"

import type { Fixture } from "@/data/Fixture"

import { useFlyerStore } from "@/stores/flyer"

const { t } = useI18n()

const flyerStore = useFlyerStore()

const {
    currentPhase,
} = useFlyer(flyerStore.flyer)

const {
    fixtures,
    getPossiblePlayers,
} = useFixtureList(currentPhase.value)

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
        label: getPlayersDescription(fixture),
        children: children.map(localiseNode)
    }
}

const getPlayersDescription = (fixture: Fixture) => {
    return fixture.scores
        .map((s, i) => {
            if (s.isBye) {
                return t('player.byeIndicator')
            }

            const ids = getPossiblePlayers(fixture, i)
            if (ids.length > 0) {
                return ids.map(getPlayerName).join("/")
            }

            return t('player.unknownIndicator')
        })
        .join(t('fixture.playerJoiner'))
}
</script>

<template>
    <OrganizationChart collapsible :value="localisedBracketData">
        <template #default="{ node }">
            <span class="text-xs">
                {{ node.label }}
            </span>
        </template>
    </OrganizationChart>
</template>
