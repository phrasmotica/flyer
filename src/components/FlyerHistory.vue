<script setup lang="ts">
import { ref } from "vue"
import { useToggle } from "@vueuse/core"

import DeleteFlyerModal from "./modals/DeleteFlyerModal.vue"
import PastFlyerInfo from "./PastFlyerInfo.vue"

import type { Flyer } from "../data/Flyer"

import { useFlyerHistoryStore } from "../stores/flyerHistory"

const emit = defineEmits<{
    viewFlyer: [flyer: Flyer]
}>()

const flyerHistoryStore = useFlyerHistoryStore()

const flyer = ref<Flyer | null>(null)

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
        <!-- MEDIUM: use a Message here -->
        <p class="my-2">
            No past flyers!
        </p>
    </div>
</template>
