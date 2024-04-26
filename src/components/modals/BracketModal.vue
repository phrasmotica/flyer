<script setup lang="ts">
import { useI18n } from "vue-i18n"

import KnockoutBracket from "../play/KnockoutBracket.vue"

const { t } = useI18n()

const visible = defineModel<boolean>("visible", {
    default: false,
})
</script>

<template>
    <Dialog
        modal
        class="bracket-modal mx-4"
        v-model:visible="visible"
        :header="t('bracket.knockoutBracket')">
        <div class="overflow-x-auto">
            <KnockoutBracket />
        </div>
    </Dialog>
</template>

<style>
.bracket-modal {
    max-width: 90vw;
}
</style>
