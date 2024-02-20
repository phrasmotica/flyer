<script setup lang="ts">
import { ref, watch } from "vue"

const props = defineProps<{
    visible: boolean
}>()

const emit = defineEmits<{
    start: []
    cancel: []
}>()

const visible = ref(props.visible)

watch(props, () => {
    visible.value = props.visible
})
</script>

<template>
    <Dialog v-model:visible="visible" modal header="Start Flyer">
        <div class="font-bold mb-2">
            Are you ready to start the flyer?
        </div>

        <div class="p-fluid">
            <Button
                class="mb-2"
                type="button"
                label="Yes"
                @click="emit('start')" />

            <Button
                type="button"
                label="No"
                severity="secondary"
                @click="emit('cancel')" />
        </div>
    </Dialog>
</template>
