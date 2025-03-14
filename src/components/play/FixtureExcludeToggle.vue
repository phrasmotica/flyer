<script setup lang="ts">
import InputSwitch from "primevue/inputswitch"

import type { Fixture } from "@/data/Fixture"

const emit = defineEmits<{
    setExcluded: [excluded: boolean]
}>()

const props = defineProps<{
    fixture: Fixture
}>()
</script>

<template>
    <div class="flex justify-content-between">
        <span>Exclude?</span>

        <InputSwitch
            :modelValue="fixture.isExcluded"
            @update:modelValue="c => emit('setExcluded', c)" />
    </div>
</template>
