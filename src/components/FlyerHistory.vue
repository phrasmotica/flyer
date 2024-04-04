<script setup lang="ts">
import { computed } from "vue"
import { useRouter } from "vue-router"
import { useToggle } from "@vueuse/core"

import ConfirmModal from "./modals/ConfirmModal.vue"
import PastFlyerInfo from "./PastFlyerInfo.vue"

import { useFlyer } from "../composables/useFlyer"

import type { Flyer } from "../data/Flyer"

import { useFlyerStore } from "../stores/flyer"
import { useFlyerHistoryStore } from "../stores/flyerHistory"

const flyerStore = useFlyerStore()
const flyerHistoryStore = useFlyerHistoryStore()

const router = useRouter()

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

const viewFlyer = (f: Flyer) => {
    flyerStore.setFlyer(f)

    router.push({
        name: "play",
        query: {
            historic: 1,
        }
    })
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
            @view="() => viewFlyer(f)"
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
