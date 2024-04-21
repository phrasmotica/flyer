<script setup lang="ts">
import { computed } from "vue"

import { useFlyer } from "@/composables/useFlyer"
import { usePhaseSettings } from "@/composables/usePhaseSettings"
import { usePlayers } from "@/composables/usePlayers"

import { useFlyerStore } from "@/stores/flyer"

const playerIds = defineModel<string[]>({
    default: [],
})

const flyerStore = useFlyerStore()

const {
    mainPhase,
    overallStandings,
    hasAlreadyPlayedOff,
} = useFlyer(flyerStore.flyer)

const {
    fixturesCanBeDrawn,
} = usePhaseSettings(mainPhase.value)

const {
    getPlayer,
} = usePlayers(mainPhase.value)

const options = computed(() => {
    return overallStandings.value.map(s => {
        const record = [s.wins, s.draws, s.losses]
        if (!fixturesCanBeDrawn.value) {
            record.splice(1, 1)
        }

        return {
            ...getPlayer(s.playerId)!,
            disabled: hasAlreadyPlayedOff(s.playerId),
            record: record.join("-"),
        }
    })
})
</script>

<template>
    <Listbox
        multiple
        v-model="playerIds"
        :options="options"
        optionValue="id"
        optionDisabled="disabled">
        <template #option="{ index, option: player }">
            <div class="flex align-items-center">
                <div class="mr-2">
                    <span class="text-right text-sm text-color-secondary font-italic w-1rem">
                        #{{ index + 1 }}
                    </span>
                </div>
                <span class="flex-grow-1" :class="player.disabled && 'line-through'">
                    {{ player.name }}
                </span>
                <div class="ml-2">
                    <span class="text-right text-sm text-color-secondary font-italic w-1rem">
                        {{ player.record }}
                    </span>
                </div>
            </div>
        </template>
    </Listbox>
</template>
