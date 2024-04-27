<script setup lang="ts">
import Panzoom, { type PanzoomObject } from '@panzoom/panzoom'
import { ref, watch } from "vue"
import { useI18n } from "vue-i18n"

import KnockoutBracket from "../play/KnockoutBracket.vue"

import { useZoomLevel } from "@/composables/useZoomLevel"

const { t } = useI18n()

const visible = defineModel<boolean>("visible", {
    default: false,
})

const {
    currentLevel,
    currentPercentage,
    minZoom,
    maxZoom,
    isMinZoom,
    isMaxZoom,
    zoomIn,
    zoomOut,
    // BUG: zoom levels less than 1 do not play nicely, due to the
    // contain: 'outside' option on line 52. Try to find a workaround...
} = useZoomLevel([1, 1.25, 1.5, 1.75, 2], 1)

watch(currentLevel, () => {
    panzoom.value?.zoom(currentLevel.value, {
        animate: true,
    })
})

const panzoom = ref<PanzoomObject>()

const show = () => {
    fixButtonsWidth()

    createPanzoom()
}

const fixButtonsWidth = () => {
    // ensures the zoom buttons are in the actual centre of the modal header
    const zoomButtons = document.getElementById('zoomButtons')
    if (!zoomButtons) {
        return
    }

    const modalButtons = <HTMLElement>document.getElementsByClassName('p-dialog-header-icons')[0]
    const newMargin = modalButtons?.offsetWidth || 0

    zoomButtons.style.marginLeft = `${newMargin}px`
}

const createPanzoom = () => {
    const orgChartTable = document
        .getElementById('bracketDiv')
        ?.getElementsByTagName("table")[0]

    if (!orgChartTable) {
        return
    }

    // matches empty org chart line cell at the bottom of the bracket
    orgChartTable.style.paddingTop = "20px"

    panzoom.value = Panzoom(orgChartTable, {
        minScale: minZoom.value,
        maxScale: maxZoom.value,
        contain: 'outside',
        cursor: 'grab',
    })
}
</script>

<template>
    <Dialog
        modal
        maximizable
        class="bracket-modal"
        v-model:visible="visible"
        :header="t('bracket.knockoutBracket')"
        @show="show">
        <template #header>
            <div
                id="zoomButtons"
                class="flex justify-content-center flex-grow-1 gap-2">
                <Button
                    class="w-5rem"
                    icon="pi pi-search-minus"
                    :disabled="isMinZoom"
                    @click="() => zoomOut()" />

                <div class="flex align-items-center justify-content-center border-1 border-round-md w-5rem font-bold text-xl">
                    {{ currentPercentage }}&percnt;
                </div>

                <Button
                    class="w-5rem"
                    icon="pi pi-search-plus"
                    :disabled="isMaxZoom"
                    @click="() => zoomIn()" />
            </div>
        </template>

        <div id="bracketDiv">
            <KnockoutBracket />
        </div>
    </Dialog>
</template>

<style>
.bracket-modal {
    max-width: 90vw;
}

.bracket-modal.p-dialog-maximized {
    max-width: 100vw;
}

.grab {
    cursor: grab!important;
}

/* BUG: this is not applying when we put the mouse down on the panzoom child */
.grabbing {
    cursor: grabbing!important;
}
</style>
