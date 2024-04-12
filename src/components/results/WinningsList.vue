<script setup lang="ts">
import Winnings from "./Winnings.vue"

import type { Winnings as WinningsModel } from "@/data/Winnings"

const props = defineProps<{
    header?: string
    winnings: WinningsModel[]
}>()
</script>

<template>
    <div>
        <p v-if="props.header" class="m-0">{{ props.header }}</p>

        <Winnings v-for="w in props.winnings" :winnings="w" />
    </div>
</template>
