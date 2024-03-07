<script setup lang="ts">
import { watch } from "vue"
import { useI18n } from "vue-i18n"

import { useFlyer } from "../composables/useFlyer"
import { usePodium } from "../composables/usePodium"
import { useSettings } from "../composables/useSettings"
import { useStandings } from "../composables/useStandings"

import type { Flyer } from "../data/Flyer"

const { d } = useI18n()

const props = defineProps<{
    flyer: Flyer
    index: number
    showDetails: boolean
}>()

const emit = defineEmits<{
    setSelected: []
    confirmDelete: []
}>()

const {
    flyer,
    results,
    players,
    settings,
    durationMinutes,
} = useFlyer(props.flyer)

const {
    winner,
} = usePodium(props.flyer)

const {
    formatName,
} = useSettings(settings.value)

const {
    firstPlace,
} = useStandings(results.value, players.value, settings.value)

watch(props, () => {
    flyer.value = props.flyer
})
</script>

<template>
    <div v-if="flyer">
        <div
            class="flex justify-content-between cursor-pointer mt-1 pt-1 mb-1"
            :class="[props.index > 0 && 'border-gray-200 border-top-1']"
            @click="emit('setSelected')">
            <div :class="[props.showDetails && 'font-bold']">
                {{ settings.name }}
            </div>

            <div class="flex-shrink-0" :class="[props.showDetails && 'font-bold']">
                {{ d(flyer.startTime!, "long") }}
            </div>
        </div>

        <div v-if="props.showDetails" class="font-italic">
            <!-- HIGH: add info about any play-offs that happened -->
            <div>
                {{ formatName }} between {{ players.length }} players, races to {{ settings.raceTo }}.&nbsp;
                Took {{ durationMinutes! }} minute(s), won by {{ (winner || firstPlace)!.name }}.
            </div>

            <div class="p-fluid my-2">
                <Button label="Delete" severity="danger" @click="emit('confirmDelete')" />
            </div>
        </div>
    </div>
</template>
