<script setup lang="ts">
import { computed, ref } from "vue"
import { useRouter } from "vue-router"

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

const showDeleteModal = ref(false)

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

const confirmDelete = () => {
    showDeleteModal.value = true
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

        hideDeleteModal()
    }
}

const hideDeleteModal = () => {
    showDeleteModal.value = false
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
