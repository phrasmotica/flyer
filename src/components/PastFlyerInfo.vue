<script setup lang="ts">
import { useI18n } from "vue-i18n"

import { useFlyer } from "../composables/useFlyer"

import type { Flyer } from "../data/Flyer"
import { watch } from "vue"

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
    players,
    settings,
    durationMinutes,
    // winner, TODO: consume usePodium(), and useStandings() for a round-robin flyer?
} = useFlyer(props.flyer)

watch(props, () => {
    flyer.value = props.flyer
})
</script>

<template>
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
        <!-- TODO: add info about any play-offs that happened -->
        <div>
            {{ settings.format }} between {{ players.length }} players, races to {{ settings.raceTo }}.&nbsp;
            <!-- Took {{ durationMinutes! }} minute(s), won by {{ winner!.name }}. -->
        </div>

        <div class="p-fluid my-2">
            <Button label="Delete" severity="danger" @click="emit('confirmDelete')" />
        </div>
    </div>
</template>
