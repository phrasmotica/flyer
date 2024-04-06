<script setup lang="ts">
import { watch } from "vue"
import { useI18n } from "vue-i18n"

import { useFlyer } from "@/composables/useFlyer"
import { usePhase } from "@/composables/usePhase"
import { usePodium } from "@/composables/usePodium"
import { usePhaseSettings } from "@/composables/usePhaseSettings"
import { useStandings } from "@/composables/useStandings"

import type { Flyer } from "@/data/Flyer"

const { d } = useI18n()

const props = defineProps<{
    flyer: Flyer
    index: number
    showDetails: boolean
}>()

const emit = defineEmits<{
    setSelected: []
    view: []
    confirmDelete: []
}>()

const {
    mainPhase,
    playOffPhases,
} = useFlyer(props.flyer)

const {
    phase,
    players,
    settings,
    durationMinutes,
} = usePhase(mainPhase.value)

const {
    winner,
} = usePodium(mainPhase.value)

const {
    formatName,
} = usePhaseSettings(settings.value)

const {
    firstPlace,
} = useStandings(mainPhase.value)

watch(props, () => {
    phase.value = props.flyer.phases[0]
})
</script>

<template>
    <div v-if="phase">
        <div
            class="flex justify-content-between cursor-pointer mt-1 pt-1 mb-1"
            :class="[props.index > 0 && 'border-gray-200 border-top-1']"
            @click="emit('setSelected')">
            <div :class="[props.showDetails && 'font-bold']">
                {{ settings.name }}
            </div>

            <div class="flex-shrink-0" :class="[props.showDetails && 'font-bold']">
                {{ d(phase.startTime!, "long") }}
            </div>
        </div>

        <div v-if="props.showDetails" class="font-italic">
            <div>
                {{ formatName }} between {{ players.length }} players, races to {{ settings.raceTo }}.&nbsp;
                Took {{ durationMinutes! }} minute(s), won by {{ (winner || firstPlace)!.name }}.

                <!-- LOW: add more play-off info -->
                <span v-if="playOffPhases.length > 0">Required {{ playOffPhases.length }} play-off(s).</span>
            </div>

            <div class="flex p-fluid gap-2 my-2">
                <Button label="View" severity="info" @click="emit('view')" />
                <Button label="Delete" severity="danger" @click="emit('confirmDelete')" />
            </div>
        </div>
    </div>
</template>
