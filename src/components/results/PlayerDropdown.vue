<script setup lang="ts">
import type { Player } from "@/data/Player"

const player = defineModel<string>()

const props = defineProps<{
    players: Player[]
}>()
</script>

<template>
    <Dropdown v-model="player" :options="props.players" optionLabel="name" optionValue="id" />
</template>
