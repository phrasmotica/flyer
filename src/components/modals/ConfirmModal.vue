<script setup lang="ts">
import { computed } from "vue"
import { useI18n } from "vue-i18n"

const { t } = useI18n()

const visible = defineModel<boolean>("visible", {
    default: false,
})

const props = defineProps<{
    visible: boolean
    header: string
    message?: string
    confirmLabel?: string
    confirmDisabled?: boolean
    cancelLabel?: string
}>()

const emit = defineEmits<{
    confirm: []
    hide: []
}>()

const confirmLabel = computed(() => props.confirmLabel || t('common.yes'))
const cancelLabel = computed(() => props.cancelLabel || t('common.no'))
</script>

<template>
    <Dialog
        modal
        class="mx-4"
        v-model:visible="visible"
        :header="props.header"
        @hide="emit('hide')">
        <div v-if="props.message" class="font-bold mb-2">
            {{ props.message }}
        </div>

        <slot />

        <div class="p-fluid">
            <Button
                class="mb-2"
                type="button"
                :label="confirmLabel"
                :disabled="props.confirmDisabled"
                @click="emit('confirm')" />

            <Button
                type="button"
                :label="cancelLabel"
                severity="secondary"
                @click="emit('hide')" />
        </div>
    </Dialog>
</template>
