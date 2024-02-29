<script setup lang="ts">
const props = defineProps<{
    name: string
    placeholder: string
    disabled?: boolean
}>()

const emit = defineEmits<{
    setName: [name: string]
}>()
</script>

<template>
    <div class="player-name-input p-fluid">
        <InputText
            :placeholder="props.placeholder"
            :disabled="props.disabled"
            :modelValue="props.name"
            @update:modelValue="v => emit('setName', v || '')" />
    </div>
</template>
