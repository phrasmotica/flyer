<script setup lang="ts">
import { computed } from "vue"

import ConfirmModal from "./ConfirmModal.vue"

import { useFlyer } from "../../composables/useFlyer"
import { useStandings } from "../../composables/useStandings"

import { useFlyerStore } from "../../stores/flyer"

const visible = defineModel<boolean>("visible", {
    default: false,
})

const emit = defineEmits<{
    confirm: []
    hide: []
}>()

const flyerStore = useFlyerStore()

const {
    mainPhase,
    phaseIsComplete,
} = useFlyer(flyerStore.flyer)

const {
    orderedPlayOffs,
} = useStandings(mainPhase.value)

const nextPlayOff = computed(() => {
    const remaining = orderedPlayOffs.value.filter(p => !phaseIsComplete(p.id))
    return remaining.length > 0 ? remaining[0] : null
})
</script>

<template>
    <ConfirmModal
        v-model:visible="visible"
        header="Start Play-Off"
        :message="`Are you sure you want to start the ${nextPlayOff?.name || '(UNKNOWN)'}?`"
        confirmLabel="Yes"
        :confirmDisabled="false"
        cancelLabel="No"
        @confirm="emit('confirm')"
        @hide="emit('hide')" />
</template>
