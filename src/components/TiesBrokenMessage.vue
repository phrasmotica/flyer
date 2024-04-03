<script setup lang="ts">
import { useFlyer } from "../composables/useFlyer"
import { usePhase } from "../composables/usePhase"
import { usePhaseSettings } from "../composables/usePhaseSettings"
import { useQueryParams } from "../composables/useQueryParams"

import { useFlyerStore } from "../stores/flyer"

const flyerStore = useFlyerStore()

const {
    mainPhase,
    playOffs,
} = useFlyer(flyerStore.flyer)

const {
    settings,
} = usePhase(mainPhase.value)

const {
    tieBreakerName,
} = usePhaseSettings(settings.value)

const {
    isHistoric,
} = useQueryParams()
</script>

<template>
    <!-- MEDIUM: restore dark mode to this message -->
    <Message severity="info" :closable="false">
        <p v-for="_, i in playOffs" class="m-0">
            <em>
                <sup class="text-xs">{{ i + 1 }}&nbsp;</sup>
                <span v-if="isHistoric">these players were tie-broken via {{ tieBreakerName }}</span>
                <span v-else>these players have been tie-broken via {{ tieBreakerName }}</span>
            </em>
        </p>
    </Message>
</template>
