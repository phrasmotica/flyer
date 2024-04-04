<script setup lang="ts">
import { computed } from "vue"
import { useToggle } from "@vueuse/core"

import ConfirmModal from "./modals/ConfirmModal.vue"
import PastFlyerInfo from "./PastFlyerInfo.vue"

import { useFlyer } from "../composables/useFlyer"

import type { Flyer } from "../data/Flyer"

import { useFlyerHistoryStore } from "../stores/flyerHistory"

const emit = defineEmits<{
    viewFlyer: [flyer: Flyer]
}>()

const flyerHistoryStore = useFlyerHistoryStore()

const {
    flyer,
    mainPhase,
} = useFlyer(null)

const [showDeleteModal, setShowDeleteModal] = useToggle()

const setSelectedFlyer = (f: Flyer) => {
    if (flyer.value?.id !== f.id) {
        flyer.value = f
    }
    else {
        flyer.value = null
    }
}

const deleteMessage = computed(() => {
    if (!mainPhase.value) {
        return ""
    }

    return `Are you sure you want to delete ${mainPhase.value.settings.name}? This cannot be undone!`
})

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

        <ConfirmModal
            v-model:visible="showDeleteModal"
            header="Delete flyer"
            :message="deleteMessage"
            confirmLabel="Yes"
            :confirmDisabled="false"
            cancelLabel="No"
            @confirm="deleteSelectedFlyer"
            @hide="() => setShowDeleteModal(false)" />
    </div>

    <div v-else>
        <p class="my-2">
            No past flyers!
        </p>
    </div>
</template>
