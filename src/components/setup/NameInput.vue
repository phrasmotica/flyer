<script setup lang="ts">
import { useTweaks } from "@/composables/useTweaks"

const value = defineModel<string>()

const props = defineProps<{
    placeholder: string
    disabled?: boolean
}>()

const { selectOnFocus } = useTweaks()
</script>

<template>
    <div class="player-name-input p-fluid">
        <IconField>
            <InputIcon v-if="!value" class="pi pi-exclamation-circle"></InputIcon>

            <InputText
                v-model="value"
                :placeholder="props.placeholder"
                :disabled="props.disabled"
                :invalid="!value"
                @focus="selectOnFocus" />
        </IconField>
    </div>
</template>

<style scoped>
.player-name-input .pi-exclamation-circle {
    /* MEDIUM: align this with the base colour themes */
    color: red;
}
</style>
