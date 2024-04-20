<script setup lang="ts">
import { computed } from "vue"
import { useI18n } from "vue-i18n"

import { useFlyer } from "@/composables/useFlyer"
import { usePhaseSettings } from "@/composables/usePhaseSettings"
import { useQueryParams } from "@/composables/useQueryParams"

import { useFlyerStore } from "@/stores/flyer"

const { t } = useI18n()

const props = defineProps<{
    inseparablePlayers: string[]
}>()

const flyerStore = useFlyerStore()

const {
    mainPhase,
    playOffs,
} = useFlyer(flyerStore.flyer)

const {
    tieBreakerName,
} = usePhaseSettings(mainPhase.value)

const {
    isHistoric,
} = useQueryParams()

const message = computed(() => {
    let key = isHistoric.value ? 'results.tiesBrokenMessageHistoric' : 'results.tiesBrokenMessage'
    if (props.inseparablePlayers.length > 0) {
        key = 'results.inseparablePlayers'
    }

    return t(key, { name: t(tieBreakerName.value) })
})
</script>

<template>
    <Message severity="info" :closable="false">
        <p v-for="_, i in playOffs" class="m-0">
            <sup class="text-xs">{{ i + 1 }}&nbsp;</sup>
            <span>{{ message }}</span>
        </p>
    </Message>
</template>
