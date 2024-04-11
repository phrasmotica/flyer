<script setup lang="ts">
import { useI18n } from "vue-i18n"
import { useDark } from "@vueuse/core"
import { v4 as uuidv4 } from "uuid"

const { t } = useI18n()

const isDark = useDark()

const id = "dark-mode-toggle-" + uuidv4()
</script>

<template>
    <div class="flex gap-4 align-items-center justify-content-between">
        <label :for="id" class="text-sm">
            {{ t('theming.darkMode') }}
        </label>

        <InputSwitch
            :id="id"
            v-model="isDark" />
    </div>
</template>
