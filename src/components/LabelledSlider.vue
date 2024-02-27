<script setup lang="ts">
const value = defineModel<number>({
    required: true,
})

const props = defineProps<{
    min?: number
    max?: number
}>()
</script>

<template>
    <div class="grid align-items-center">
        <div class="col-10">
            <div class="pl-2">
                <Slider
                    v-model="value"
                    :min="props.min" :max="props.max" />
            </div>
        </div>

        <div class="col-2">
            <InputNumber
                v-model="value"
                :min="props.min" :max="props.max"
                inputClass="p-1 text-center font-bold w-full">
            </InputNumber>
        </div>
    </div>
</template>
