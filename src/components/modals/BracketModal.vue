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
        class="mx-4"
        v-model:visible="visible"
        :header="t('bracket.knockoutBracket')">
        <div>
            <KnockoutBracket />
        </div>
    </Dialog>
</template>
