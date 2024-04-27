<script setup lang="ts">
import Panzoom, { type PanzoomObject } from '@panzoom/panzoom'
import { ref, watch } from "vue"
import { useI18n } from "vue-i18n"

import KnockoutBracket from "../play/KnockoutBracket.vue"

import { useCursorGrab } from "@/composables/useCursorGrab"
import { useZoomLevel } from "@/composables/useZoomLevel"

const { t } = useI18n()

const visible = defineModel<boolean>("visible", {
    default: false,
})

const {
    cursorClass,
    setGrabbing,
} = useCursorGrab()

const {
    currentLevel,
    currentPercentage,
    zoomIn,
    zoomOut,
} = useZoomLevel()

watch(currentLevel, () => {
    panzoom.value?.zoom(currentLevel.value, {
        animate: true,
    })
})

const panzoom = ref<PanzoomObject>()

const createPanzoom = () => {
    const elem = document.getElementById('bracketDiv')
    if (!elem) {
        return
    }

    panzoom.value = Panzoom(elem, {
        minScale: 0.25,
        maxScale: 2,
    })
}
</script>

<template>
    <Dialog
        modal
        class="bracket-modal mx-4"
        v-model:visible="visible"
        :header="t('bracket.knockoutBracket')"
        @show="createPanzoom">
        <template #header>
            <div class="flex-grow-1 flex gap-2 mr-2">
                <Button
                    class="w-5rem"
                    icon="pi pi-search-minus"
                    @click="() => zoomOut()" />

                <div class="flex align-items-center justify-content-center border-1 border-round-md w-5rem font-bold text-xl">
                    {{ currentPercentage }}&percnt;
                </div>

                <Button
                    class="w-5rem"
                    icon="pi pi-search-plus"
                    @click="() => zoomIn()" />
            </div>
        </template>

        <div
            id="bracketDiv"
            :class="cursorClass"
            @mousedown="setGrabbing(true)"
            @mouseup="setGrabbing(false)"
            @mouseleave="setGrabbing(false)">
            <KnockoutBracket />
        </div>
    </Dialog>
</template>

<style>
.bracket-modal {
    max-width: 90vw;
}

.grab {
    cursor: grab!important;
}

/* BUG: this is not applying when we put the mouse down on the panzoom child */
.grabbing {
    cursor: grabbing!important;
}
</style>
