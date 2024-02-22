<script setup lang="ts">
import { ref, watch } from "vue"

import type { Player } from "../data/Player"

const props = defineProps<{
    players: Player[]
    selectedPlayerId: string
}>()

const emit = defineEmits<{
    select: [playerId: string]
}>()

const player = ref(props.selectedPlayerId)

watch(player, () => {
    emit("select", player.value)
})
</script>

<template>
    <Dropdown v-model="player" :options="props.players" optionLabel="name" optionValue="id" />
</template>
