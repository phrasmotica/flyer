<script setup lang="ts">
import { ref } from "vue"

import type { Flyer } from "../data/Flyer"

import { useFlyerHistoryStore } from "../stores/flyerHistory"
import { differenceInMinutes } from "date-fns"

const flyerHistoryStore = useFlyerHistoryStore()

const selectedFlyer = ref("")

const setSelectedFlyer = (f: Flyer) => {
    if (selectedFlyer.value !== f.id) {
        selectedFlyer.value = f.id
    }
    else {
        selectedFlyer.value = ""
    }
}

const isSelected = (f: Flyer) => selectedFlyer.value === f.id

const getDuration = (f: Flyer) => {
    if (!f.startTime || !f.finishTime) {
        return "???"
    }

    return differenceInMinutes(new Date(f.finishTime), new Date(f.startTime))
}

const getWinnerName = (f: Flyer) => flyerHistoryStore.getWinner(f)?.name || "???"
</script>

<template>
    <div v-for="f, i in flyerHistoryStore.pastFlyers" class="cursor-pointer" @click="() => setSelectedFlyer(f)">
        <div class="flex justify-content-between mt-1 pt-1 mb-1" :class="[i > 0 && 'border-gray-200 border-top-1']">
            <div :class="[isSelected(f) && 'font-bold']">
                {{ f.settings.name }}
            </div>

            <div :class="[isSelected(f) && 'font-bold']">
                {{ f.startTime }}
            </div>
        </div>

        <div v-if="isSelected(f)" class="font-italic">
            {{ f.settings.format }} between {{ f.players.length }} players, races to {{ f.settings.raceTo }}.&nbsp;
            Took {{ getDuration(f) }} minute(s), won by {{ getWinnerName(f) }}.
        </div>
    </div>
</template>
