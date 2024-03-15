<script setup lang="ts">
const value = defineModel<string>()

const props = defineProps<{
    placeholder: string
    disabled?: boolean
}>()
</script>

<template>
    <div class="player-name-input p-fluid">
        <IconField>
            <InputIcon v-if="!value" class="pi pi-exclamation-circle"></InputIcon>

            <InputText
                v-model="value"
                :placeholder="props.placeholder"
                :disabled="props.disabled"
                :invalid="!value" />
        </IconField>
    </div>
</template>

<style scoped>
.player-name-input .pi-exclamation-circle {
    color: red;
}
</style>
