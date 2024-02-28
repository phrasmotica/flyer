<script setup lang="ts">
import { onUpdated, ref } from "vue"
import { v4 as uuidv4 } from "uuid"

const props = defineProps<{
    header: string
}>()

const showContent = ref(true)

const id = "flyer-form-section-" + uuidv4()

onUpdated(() => {
    const formSection = document.getElementById(id)
    if (formSection) {
        const buttons = formSection.getElementsByClassName("p-inputnumber-button")
        for (const b of buttons) {
            // hack to stop InputNumber elements from focusing after pressing their buttons.
            // Important for mobile UX
            b.addEventListener("mouseup", () => {
                (<any>document.activeElement)?.blur()
            })
        }
    }
})
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

    <div :id="id" v-if="showContent">
        <slot />
    </div>
</template>
