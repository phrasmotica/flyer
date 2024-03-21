<script setup lang="ts">
import { watch } from "vue"
import { useToggle } from "@vueuse/core"

import FixtureCard from "./FixtureCard.vue"

import { useFlyer } from "@/composables/useFlyer"
import { usePhase } from "@/composables/usePhase"
import { useQueryParams } from "../composables/useQueryParams"
import { RoundStatus, useRound } from "../composables/useRound"

import type { Fixture } from "../data/Fixture"
import type { Round } from "../data/Round"

import { useFlyerStore } from "../stores/flyer"

const props = defineProps<{
    round: Round
    highlightedFixtureId: string
}>()

const emit = defineEmits<{
    showModal: [fixture: Fixture]
    highlight: [fixtureId: string]
}>()

const flyerStore = useFlyerStore()

const {
    currentPhase,
} = useFlyer(flyerStore.flyer)

const {
    settings,
} = usePhase(currentPhase.value)

const {
    name,
    fixtures,
    status,
} = useRound(props.round, settings.value)

const {
    isHistoric,
} = useQueryParams()

watch(status, () => {
    if (status.value === RoundStatus.Ready) {
        showContent.value = true
    }
})

const shouldShowContent = () => {
    return isHistoric.value || [RoundStatus.Ready, RoundStatus.InProgress].includes(status.value)
}

const [showContent, toggleContent] = useToggle(shouldShowContent())
const [showComments, toggleComments] = useToggle(false)
</script>

<template>
    <div
        class="flex align-items-baseline"
        :class="[showContent && 'border-bottom-1']">
        <h3 class="font-bold cursor-pointer flex-1" @click="toggleContent()">
            {{ name }}
        </h3>

        <div class="ml-2">
            <i v-if="showContent"
                class="pi pi-comments mr-2 cursor-pointer"
                :class="[showComments ? 'toggle-on' : 'text-color-secondary']"
                @click="toggleComments()" />

            <i v-if="status === RoundStatus.Waiting" class="pi pi-question-circle" />
            <i v-if="status === RoundStatus.Ready" class="pi pi-clock" />
            <i v-if="status === RoundStatus.InProgress" class="pi pi-spin pi-spinner" />
            <i v-if="status === RoundStatus.Finished" class="pi pi-check-circle" />
            <i v-if="status === RoundStatus.Cancelled" class="pi pi-times-circle" />
        </div>
    </div>

    <div v-if="showContent">
        <div v-for="f, i in fixtures" class="py-1" :class="[i > 0 && 'border-gray-200 border-top-1']">
            <FixtureCard
                :fixture="f"
                :highlightedFixtureId="props.highlightedFixtureId"
                :showComment="showComments"
                @showModal="emit('showModal', f)"
                @highlight="emit('highlight', f.id)" />
        </div>
    </div>
</template>

<style scoped>
.toggle-on {
    color: #0ea5e9;
}
</style>
