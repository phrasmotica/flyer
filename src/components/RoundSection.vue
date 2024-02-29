<script setup lang="ts">
import { ref } from "vue"

const props = defineProps<{
    name: string
    hidden?: boolean
}>()

const showContent = ref(!props.hidden)
</script>

<template>
    <div
        class="flex align-items-baseline justify-content-between cursor-pointer"
        :class="[showContent && 'border-bottom-1 border-gray-200']"
        @click="showContent = !showContent">
        <h3 class="font-bold">{{ props.name }}</h3>

        <div>
            <span v-if="showContent" class="font-italic">&nbsp;(click to hide)</span>
            <span v-else class="font-italic">&nbsp;(click to show)</span>
        </div>
    </div>

    <div v-if="showContent">
        <slot />
    </div>
</template>
