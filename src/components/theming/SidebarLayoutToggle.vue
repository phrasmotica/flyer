<script setup lang="ts">
import { useI18n } from "vue-i18n"
import { v4 as uuidv4 } from "uuid"

import { sidebarPositionOptions, useUiStore } from "@/stores/ui"

const { t } = useI18n()

const uiStore = useUiStore()

const id = "sidebar-position-toggle-" + uuidv4()
</script>

<template>
    <div class="flex gap-4 align-items-center justify-content-between">
        <label :for="id" class="text-sm">
            {{ t('theming.sidebarPosition') }}
        </label>

        <SelectButton
            :id="id"
            v-model="uiStore.settings.sidebarPosition"
            :options="sidebarPositionOptions"
            optionLabel="name"
            optionValue="value" />
    </div>
</template>
