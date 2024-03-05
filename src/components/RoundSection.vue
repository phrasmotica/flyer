<script setup lang="ts">
import { computed, ref } from "vue"

import { RoundStatus, useFlyer } from "../composables/useFlyer"

import { useFlyerStore, usePlayOffStore } from "../stores/flyer"

const props = defineProps<{
    name: string
    roundIndex: number
    hidden?: boolean
    isPlayOff?: boolean
}>()

const defaultFlyerStore = useFlyerStore()
const playOffStore = usePlayOffStore()

const flyerStore = props.isPlayOff ? playOffStore : defaultFlyerStore

const { getRoundStatus } = useFlyer(flyerStore.flyer)

const showContent = ref(!props.hidden)

const status = computed(() => getRoundStatus(props.roundIndex))

const toggle = () => {
    // TODO: don't allow showing content if the round is waiting for a
    // previous one to be completed
    showContent.value = !showContent.value
}
</script>

<template>
    <div
        class="flex align-items-baseline justify-content-between cursor-pointer"
        :class="[showContent && 'border-bottom-1']"
        @click="toggle">
        <h3 class="font-bold">{{ props.name }}</h3>

        <div>
            <i v-if="status === RoundStatus.Waiting" class="pi pi-question-circle ml-2" />
            <i v-if="status === RoundStatus.Ready" class="pi pi-clock ml-2" />
            <i v-if="status === RoundStatus.InProgress" class="pi pi-spin pi-spinner ml-2" />
            <i v-if="status === RoundStatus.Finished" class="pi pi-check-circle ml-2" />
        </div>
    </div>

    <div v-if="showContent">
        <slot />
    </div>
</template>
