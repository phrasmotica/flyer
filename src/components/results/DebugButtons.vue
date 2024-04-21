<script setup lang="ts">
import { computed } from "vue"

import { useFlyer } from "@/composables/useFlyer"

import { useFlyerStore } from "@/stores/flyer"

const flyerStore = useFlyerStore()

const {
    completedPlayOffs,
} = useFlyer(flyerStore.flyer)

const canResetPlayOffs = computed(() => completedPlayOffs.value.length > 0)

const resetPlayOffs = () => {
    if (!canResetPlayOffs.value) {
        return
    }

    flyerStore.resetPlayOffs()
}
</script>

<template>
    <div>
        <!-- debug stuff, no need to localise -->
        <Button
            label="Reset play-offs"
            severity="help"
            :disabled="!canResetPlayOffs"
            @click="resetPlayOffs" />
    </div>
</template>
