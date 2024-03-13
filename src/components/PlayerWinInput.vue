<script setup lang="ts">
import { computed } from "vue"

import { useFlyer } from "../composables/useFlyer"

import { useFlyerStore } from "../stores/flyer"

const props = defineProps<{
    playerId: string
    winner: string
    ranOut: string
    finished?: boolean
}>()

const emit = defineEmits<{
    setWinner: []
    setRanOut: []
}>()

const flyerStore = useFlyerStore()

const {
    getPlayerName,
} = useFlyer(flyerStore.flyer)

const isWinner = computed(() => props.playerId === props.winner)

const didRunOut = computed(() => props.playerId === props.ranOut)
</script>

<template>
    <div class="flex flex-column align-items-center">
        <div class="font-bold">
            {{ getPlayerName(props.playerId) }}
        </div>

        <div v-if="props.finished" class="text-4xl font-bold">
            {{ isWinner ? 'W' : 'L' }}
        </div>

        <RadioButton v-else
            name="winner"
            :value="props.playerId"
            :modelValue="props.winner"
            @update:modelValue="emit('setWinner')" />

        <div class="text-xs mt-2">
            Ran Out
        </div>

        <div v-if="props.finished">
            <i v-if="didRunOut" class="pi pi-check" />
            <i v-else class="pi pi-times" />
        </div>

        <Checkbox v-else
            binary
            :modelValue="didRunOut"
            @update:modelValue="emit('setRanOut')" />
    </div>
</template>
