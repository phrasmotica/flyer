<script setup lang="ts">
import { computed } from "vue"
import { useI18n } from "vue-i18n"

import { useArrayGroupBy } from "@/composables/useArray"
import { useFlyer } from "@/composables/useFlyer"
import { usePhaseSettings } from "@/composables/usePhaseSettings"
import { useQueryParams } from "@/composables/useQueryParams"

import type { PlayOff } from "@/data/PlayOff"

import { useFlyerStore } from "@/stores/flyer"

type TieBreakerState = 'resolved' | 'unresolved'

const { t } = useI18n()

const flyerStore = useFlyerStore()

const {
    mainPhase,
    playOffs,
    inseparablePlayers,
    hasAlreadyPlayedOff,
    phaseIsComplete,
} = useFlyer(flyerStore.flyer)

const {
    tieBreakerName,
} = usePhaseSettings(mainPhase.value)

const {
    isHistoric,
} = useQueryParams()

const groupedTieBreakers = useArrayGroupBy<PlayOff, TieBreakerState>(
    playOffs.value.filter(p => {
        return !phaseIsComplete(p.id) && p.players.every(x => !hasAlreadyPlayedOff(x.id))
    }),
    p => p.records.every(r => inseparablePlayers.value.includes(r.playerId)) ? 'unresolved' : 'resolved')

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
</script>

<template>
    <div>
        <Message v-for="group in sortedGroups" class="my-1" :severity="group.severity" :closable="false">
            <p v-for="p in group.tieBreakers" class="m-0">
                <sup class="text-xs">{{ p.index }}&nbsp;</sup>
                <span>{{ group.message }}</span>
            </p>
        </Message>
    </div>
</template>
