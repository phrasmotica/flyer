<script setup lang="ts">
import { useI18n } from "vue-i18n"

import { useFlyer } from "@/composables/useFlyer"
import { usePlayers } from "@/composables/usePlayers"

import type { Fixture } from "@/data/Fixture"

import { useFlyerStore } from "@/stores/flyer"

const { t } = useI18n()

const breakerId = defineModel<string>()

const props = defineProps<{
    fixture: Fixture
    playerId: string
}>()

const flyerStore = useFlyerStore()

const {
    currentPhase,
} = useFlyer(flyerStore.flyer)

const {
    getPlayerName,
} = usePlayers(currentPhase.value)
</script>

<template>
    <div class="flex flex-column align-items-center">
        <div class="font-bold">
            {{ getPlayerName(props.playerId) || t("player.unknownIndicator") }}
        </div>

        <RadioButton
            class="my-2"
            name="hasBreak"
            :value="props.playerId"
            v-model="breakerId" />
    </div>
</template>
