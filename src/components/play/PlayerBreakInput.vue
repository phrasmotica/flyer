<script setup lang="ts">
import { useI18n } from "vue-i18n"

import { useFlyer } from "@/composables/useFlyer"
import { usePhase } from "@/composables/usePhase"

import type { Fixture } from "@/data/Fixture"

import { useFlyerStore } from "@/stores/flyer"

const { t } = useI18n()

const props = defineProps<{
    fixture: Fixture
    playerId: string
    breakerId: string // MEDIUM: use defineModel() instead
}>()

const emit = defineEmits<{
    setBreakerId: []
}>()

const flyerStore = useFlyerStore()

const {
    currentPhase,
} = useFlyer(flyerStore.flyer)

const {
    getPlayerName,
} = usePhase(currentPhase.value)
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
            :modelValue="props.breakerId"
            @update:modelValue="emit('setBreakerId')" />
    </div>
</template>
