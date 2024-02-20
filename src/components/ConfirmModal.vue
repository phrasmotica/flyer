<script setup lang="ts">
import { ref, watch } from "vue"

const props = defineProps<{
    visible: boolean
    header: string
    message: string
}>()

const emit = defineEmits<{
    confirm: []
    cancel: []
}>()

const visible = ref(props.visible)

watch(props, () => {
    visible.value = props.visible
})
</script>

<template>
    <Dialog v-model:visible="visible" modal :header="props.header">
        <div class="font-bold mb-2">
            {{ props.message }}
        </div>

        <div class="p-fluid">
            <Button
                class="mb-2"
                type="button"
                label="Yes"
                @click="emit('confirm')" />

            <Button
                type="button"
                label="No"
                severity="secondary"
                @click="emit('cancel')" />
        </div>
    </Dialog>
</template>
