<script setup lang="ts">
import { computed } from "vue"
import { useI18n } from "vue-i18n"

import KnockoutBracket from "../play/KnockoutBracket.vue"

import { useCursorGrab } from "@/composables/useCursorGrab"
import { useZoomLevel } from "@/composables/useZoomLevel"

const { t } = useI18n()

const visible = defineModel<boolean>("visible", {
    default: false,
})

const {
    cursorStyle,
    setGrabbing,
} = useCursorGrab()

const {
    currentPercentage,
    zoomIn,
    zoomOut,
} = useZoomLevel()

const zoomClass = computed(() => `zoom-${currentPercentage.value}`)
</script>

<template>
    <Dialog
        modal
        class="bracket-modal mx-4"
        v-model:visible="visible"
        :header="t('bracket.knockoutBracket')">

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

        <!-- BUG: knockout bracket <table> element is cut off weirdly when
        the zoom is not 100% -->
        <div v-dragscroll class="overflow-x-auto overflow-y-auto">
            <div
                id="bracketDiv"
                :class="zoomClass"
                :style="cursorStyle"
                @mousedown="setGrabbing(true)"
                @mouseup="setGrabbing(false)"
                @mouseleave="setGrabbing(false)">
                <KnockoutBracket />
            </div>
        </div>
    </Dialog>
</template>

<style>
.bracket-modal {
    max-width: 90vw;
}

#bracketDiv {
    transform-origin: center center;
}

#bracketDiv.zoom-25 {
    transform: scale(0.25);
}

#bracketDiv.zoom-50 {
    transform: scale(0.5);
}

#bracketDiv.zoom-75 {
    transform: scale(0.75);
}

#bracketDiv.zoom-125 {
    transform: scale(1.25);
}

#bracketDiv.zoom-150 {
    transform: scale(1.5);
}

#bracketDiv.zoom-175 {
    transform: scale(1.75);
}

#bracketDiv.zoom-200 {
    transform: scale(2);
}
</style>
