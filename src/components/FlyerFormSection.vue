<script setup lang="ts">
import { ref } from "vue"

const props = defineProps<{
    header: string
}>()

const showContent = ref(true)
</script>

<template>
    <div
        class="flex align-items-end justify-content-between border-bottom-1 border-gray-200 mb-2 cursor-pointer"
        @click="showContent = !showContent">
        <h2>{{ props.header }}</h2>

        <div class="mb-1">
            <span v-if="showContent" class="font-italic">&nbsp;(click to hide)</span>
            <span v-else class="font-italic">&nbsp;(click to show)</span>
        </div>
    </div>

    <!-- TODO: revert to using v-if, and use the onUpdated() hook to re-add the
    blurring event listener hack from FlyerForm.vue -->
    <div :class="[showContent ? 'block' : 'hidden']">
        <slot />
    </div>
</template>
