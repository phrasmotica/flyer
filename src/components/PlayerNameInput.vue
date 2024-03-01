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
        <IconField>
            <InputIcon v-if="!props.name" class="pi pi-exclamation-circle"></InputIcon>

            <InputText
                :placeholder="props.placeholder"
                :disabled="props.disabled"
                :invalid="!props.name"
                :modelValue="props.name"
                @update:modelValue="v => emit('setName', v || '')" />
        </IconField>
    </div>
</template>

<style scoped>
.player-name-input .pi-exclamation-circle {
    color: red;
}
</style>
