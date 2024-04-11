<script setup lang="ts">
import { computed, onUpdated, ref } from "vue"
import { v4 as uuidv4 } from "uuid"

import { useTweaks } from "@/composables/useTweaks"
import { useI18n } from "vue-i18n"

const { t } = useI18n()

const props = defineProps<{
    header: string
    hidden?: boolean
    noUnderline?: boolean
}>()

const { blurNumberInputs } = useTweaks()

const showContent = ref(!props.hidden)

const id = "flyer-form-section-" + uuidv4()

const clickMessage = computed(() => {
    return t(showContent.value ? 'form.clickToHide' : 'form.clickToShow')
})

onUpdated(() => {
    blurNumberInputs(id)
})
</script>

<template>
    <div
        class="flex align-items-baseline justify-content-between cursor-pointer"
        :class="[(!props.noUnderline || showContent) && 'border-bottom-1 border-gray-200 mb-2']"
        @click="showContent = !showContent">
        <h2>{{ props.header }}</h2>

        <div>
            <span class="font-italic">{{ clickMessage }}</span>
        </div>
    </div>

    <div :id="id" v-if="showContent">
        <slot />
    </div>
</template>
