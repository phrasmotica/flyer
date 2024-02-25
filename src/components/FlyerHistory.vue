<script setup lang="ts">
import { computed, ref } from "vue"

import ConfirmModal from "../components/ConfirmModal.vue"

import type { Flyer } from "../data/Flyer"

import { useFlyerHistoryStore } from "../stores/flyerHistory"
import { differenceInMinutes } from "date-fns"

const flyerHistoryStore = useFlyerHistoryStore()

const selectedFlyer = ref<Flyer | null>(null)
const showDeleteModal = ref(false)

const setSelectedFlyer = (f: Flyer) => {
    if (selectedFlyer.value?.id !== f.id) {
        selectedFlyer.value = f
    }
    else {
        selectedFlyer.value = null
    }
}

const confirmDelete = () => {
    showDeleteModal.value = true
}

const deleteMessage = computed(() => {
    if (!selectedFlyer.value) {
        return ""
    }

    return `Are you sure you want to delete ${selectedFlyer.value.settings.name}? This cannot be undone!`
})

const deleteSelectedFlyer = () => {
    if (selectedFlyer.value) {
        flyerHistoryStore.deleteFlyer(selectedFlyer.value)

        hideDeleteModal()
    }
}

const hideDeleteModal = () => {
    showDeleteModal.value = false
}

const isSelected = (f: Flyer) => selectedFlyer.value?.id === f.id

const getDuration = (f: Flyer) => {
    if (!f.startTime || !f.finishTime) {
        return "???"
    }

    return differenceInMinutes(new Date(f.finishTime), new Date(f.startTime))
}

const getWinnerName = (f: Flyer) => flyerHistoryStore.getWinner(f)?.name || "???"
</script>

<template>
    <div v-if="flyerHistoryStore.pastFlyers.length > 0">
        <div v-for="f, i in flyerHistoryStore.pastFlyers">
            <div
                class="flex justify-content-between cursor-pointer mt-1 pt-1 mb-1"
                :class="[i > 0 && 'border-gray-200 border-top-1']"
                @click="() => setSelectedFlyer(f)">
                <div :class="[isSelected(f) && 'font-bold']">
                    {{ f.settings.name }}
                </div>

                <div :class="[isSelected(f) && 'font-bold']">
                    {{ f.startTime }}
                </div>
            </div>

            <div v-if="isSelected(f)" class="font-italic">
                <div>
                    {{ f.settings.format }} between {{ f.players.length }} players, races to {{ f.settings.raceTo }}.&nbsp;
                    Took {{ getDuration(f) }} minute(s), won by {{ getWinnerName(f) }}.
                </div>

                <div class="p-fluid my-2">
                    <Button label="Delete" severity="danger" @click="confirmDelete" />
                </div>
            </div>
        </div>

        <ConfirmModal
            :visible="showDeleteModal"
            header="Delete flyer"
            :message="deleteMessage"
            confirmLabel="Yes"
            :confirmDisabled="false"
            cancelLabel="No"
            @confirm="deleteSelectedFlyer"
            @hide="hideDeleteModal" />
    </div>

    <div v-else>
        <p class="my-2">
            No past flyers!
        </p>
    </div>
</template>
