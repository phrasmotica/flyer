<script setup lang="ts">
import { computed } from "vue"
import { useI18n } from "vue-i18n"

import { useArrayGroupBy } from "@/composables/useArray"
import { useFlyer } from "@/composables/useFlyer"
import { useQueryParams } from "@/composables/useQueryParams"
import { usePhaseSpecification } from "@/composables/useSpecification"

import type { TieBreakerInfo } from "@/data/TieBreakerInfo"

import { useFlyerStore } from "@/stores/flyer"

type TieBreakerState = 'resolved' | 'unresolved'

const { t } = useI18n()

const flyerStore = useFlyerStore()

const {
    mainPhase,
    stillRelevantTieBreakers,
    inseparablePlayers,
} = useFlyer(flyerStore.flyer)

const {
    tieBreakerName,
} = usePhaseSpecification(mainPhase.value)

const {
    isHistoric,
} = useQueryParams()

const groupedTieBreakers = useArrayGroupBy<TieBreakerInfo, TieBreakerState>(
    stillRelevantTieBreakers,
    t => t.records.every(r => inseparablePlayers.value.includes(r.playerId)) ? 'unresolved' : 'resolved')

const getSeverity = (state: TieBreakerState) => state === 'unresolved' ? "warn" : "info"

const getMessage = (state: TieBreakerState) => {
    let key = isHistoric.value ? 'results.tiesBrokenMessageHistoric' : 'results.tiesBrokenMessage'

    if (state === 'unresolved') {
        key = 'results.inseparablePlayers'
    }

    return t(key, { name: t(tieBreakerName.value) })
}

const sortedGroups = computed(() => [...groupedTieBreakers.value]
    .map(g => ({
        key: g[0],
        tieBreakers: g[1].sort((p, q) => p.index - q.index),
        severity: getSeverity(g[0]),
        message: getMessage(g[0]),
    }))
    // group with lower-indexed first tie breaker comes first
    .sort((g, h) => g.tieBreakers[0].index - h.tieBreakers[0].index))

const getIndex = (tieBreaker: TieBreakerInfo) => {
    return stillRelevantTieBreakers.value.findIndex(t => t.id === tieBreaker.id) + 1
}
</script>

<template>
    <div>
        <Message v-for="group in sortedGroups" class="my-1" :severity="group.severity" :closable="false">
            <p v-for="t in group.tieBreakers" class="m-0">
                <sup class="text-xs">{{ getIndex(t) }}&nbsp;</sup>
                <span>{{ group.message }}</span>
            </p>
        </Message>
    </div>
</template>
