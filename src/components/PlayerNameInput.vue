<script setup lang="ts">
const props = defineProps<{
    name: string
    placeholder: string
    disabled: boolean
}>()

const emit = defineEmits<{
    setName: [name: string]
}>()
</script>

<template>
    <div class="player-name-input">
        <input 
            class="form-control" 
            :placeholder="props.placeholder"
            :disabled="props.disabled" 
            :value="props.name" 
            @input="(e: any) => emit('setName', e.target.value)" />
    </div>
</template>
