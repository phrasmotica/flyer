<script setup lang="ts">
import { useToggle } from "@vueuse/core"

import DeleteFlyerModal from "./modals/DeleteFlyerModal.vue"
import PastFlyerInfo from "./PastFlyerInfo.vue"

import { useMaybe } from "../composables/useMaybe"

import type { Flyer } from "../data/Flyer"

import { useFlyerHistoryStore } from "../stores/flyerHistory"

const emit = defineEmits<{
    viewFlyer: [flyer: Flyer]
}>()

const flyerHistoryStore = useFlyerHistoryStore()

const flyer = useMaybe<Flyer>()

const [showDeleteModal, setShowDeleteModal] = useToggle()

const setSelectedFlyer = (f: Flyer) => {
    if (flyer.value?.id !== f.id) {
        flyer.value = f
    }
    else {
        flyer.value = null
    }
}

const deleteSelectedFlyer = () => {
    if (flyer.value) {
        flyerHistoryStore.deleteFlyer(flyer.value)

        setShowDeleteModal(false)
    }
}

const isSelected = (f: Flyer) => flyer.value?.id === f.id
</script>

<template>
    <div v-if="flyerHistoryStore.pastFlyers.length > 0">
        <PastFlyerInfo v-for="f, i in flyerHistoryStore.pastFlyers"
            :flyer="f"
            :index="i"
            :showDetails="isSelected(f)"
            @setSelected="() => setSelectedFlyer(f)"
            @view="emit('viewFlyer', f)"
            @confirmDelete="() => setShowDeleteModal(true)" />

        <DeleteFlyerModal
            v-model:visible="showDeleteModal"
            :selectedFlyer="flyer"
            @confirm="deleteSelectedFlyer"
            @hide="() => setShowDeleteModal(false)" />
    </div>

    <div v-else>
        <Message severity="info" :closable="false">
            No past flyers!
        </Message>
    </div>
</template>
