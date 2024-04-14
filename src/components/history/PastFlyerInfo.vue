<script setup lang="ts">
import { watch } from "vue"
import { useI18n } from "vue-i18n"

import { useFlyer } from "@/composables/useFlyer"
import { usePhase } from "@/composables/usePhase"
import { usePlayers } from "@/composables/usePlayers"
import { usePodium } from "@/composables/usePodium"
import { usePhaseSettings } from "@/composables/usePhaseSettings"
import { usePhaseTiming } from "@/composables/usePhaseTiming"
import { useStandings } from "@/composables/useStandings"

import type { Flyer } from "@/data/Flyer"

const { d, t } = useI18n()

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
} = usePhase(mainPhase.value)

const {
    durationMinutes,
} = usePhaseTiming(mainPhase.value)

const {
    players,
} = usePlayers(mainPhase.value)

const {
    winner,
} = usePodium(mainPhase.value)

const {
    settings,
    formatName,
} = usePhaseSettings(mainPhase.value)

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
                {{ t("history.formatDescription", {
                    formatName: t(formatName),
                    playerCount: players.length,
                    raceTo: settings.raceTo,
                }) }}

                {{ t("history.tookNMinutes", {
                    n: durationMinutes!,
                    winner: (winner || firstPlace)!.name,
                }) }}

                <!-- LOW: add more play-off info -->
                <span v-if="playOffPhases.length > 0">
                    {{ t("history.requiredNPlayOffs", playOffPhases.length) }}
                </span>
            </div>

            <div class="flex p-fluid gap-2 my-2">
                <Button :label="t('common.view')" severity="info" @click="emit('view')" />
                <Button :label="t('common.delete')" severity="danger" @click="emit('confirmDelete')" />
            </div>
        </div>
    </div>
</template>
