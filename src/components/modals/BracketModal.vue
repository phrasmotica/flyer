<script setup lang="ts">
import { useI18n } from "vue-i18n"

import KnockoutBracket from "../play/KnockoutBracket.vue"

import { useCursorGrab } from "@/composables/useCursorGrab"

const { t } = useI18n()

const visible = defineModel<boolean>("visible", {
    default: false,
})

const {
    cursorStyle,
    setGrabbing,
} = useCursorGrab()
</script>

<template>
    <Dialog
        modal
        class="bracket-modal mx-4"
        v-model:visible="visible"
        :header="t('bracket.knockoutBracket')">
        <div v-dragscroll
            class="overflow-x-auto"
            :style="cursorStyle"
            @mousedown="setGrabbing(true)"
            @mouseup="setGrabbing(false)">
            <KnockoutBracket />
        </div>
    </Dialog>
</template>

<style>
.bracket-modal {
    max-width: 90vw;
}
</style>
