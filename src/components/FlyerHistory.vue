<script setup lang="ts">
import { computed, ref } from "vue"

import ConfirmModal from "./ConfirmModal.vue"
import PastFlyerInfo from "./PastFlyerInfo.vue"

import type { Flyer } from "../data/Flyer"

import { useFlyerHistoryStore } from "../stores/flyerHistory"

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
</script>

<template>
    <div v-if="flyerHistoryStore.pastFlyers.length > 0">
        <PastFlyerInfo v-for="f, i in flyerHistoryStore.pastFlyers"
            :flyer="f"
            :index="i"
            :showDetails="isSelected(f)"
            @setSelected="() => setSelectedFlyer(f)"
            @confirmDelete="confirmDelete" />

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
