<script setup lang="ts">
import { computed, ref } from "vue"

import { RoundStatus, useFlyer } from "../composables/useFlyer"

import { useFlyerStore } from "../stores/flyer"

const props = defineProps<{
    name: string
    roundIndex: number
    hidden?: boolean
}>()

const flyerStore = useFlyerStore()

const { getRoundStatus } = useFlyer(flyerStore.flyer)

const showContent = ref(!props.hidden)

const status = computed(() => getRoundStatus(props.roundIndex))
</script>

<template>
    <div
        class="flex align-items-baseline justify-content-between cursor-pointer"
        :class="[showContent && 'border-bottom-1 border-gray-200']"
        @click="showContent = !showContent">
        <h3 class="font-bold">{{ props.name }}</h3>

        <div>
            <i v-if="status === RoundStatus.Waiting" class="pi pi-question-circle ml-2" />
            <i v-if="status === RoundStatus.Ready" class="pi pi-clock ml-2" />
            <i v-if="status === RoundStatus.InProgress" class="pi pi-circle ml-2" />
            <i v-if="status === RoundStatus.Finished" class="pi pi-check-circle ml-2" />
        </div>
    </div>

    <div v-if="showContent">
        <slot />
    </div>
</template>
