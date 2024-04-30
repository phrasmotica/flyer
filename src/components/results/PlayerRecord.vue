<script setup lang="ts">
import { computed } from "vue"
import { useI18n } from "vue-i18n"

import MatchText from "./MatchText.vue"

import { useFlyer } from "@/composables/useFlyer"

import { useFlyerStore } from "@/stores/flyer"

const { t } = useI18n()

const props = defineProps<{
    playerId: string
}>()

const flyerStore = useFlyerStore()

const {
    getFinishedFixtures,
} = useFlyer(flyerStore.flyer)

const fixturesByPhase = computed(() => {
    return getFinishedFixtures(props.playerId).filter(p => p.fixtures.length > 0)
})
</script>

<template>
    <div v-if="fixturesByPhase.length > 0">
        <div v-for="p in fixturesByPhase">
            <p class="m-0">{{ p.name }}</p>

            <ul class="m-0">
                <!-- MEDIUM: compress this into a list of W/L records against
                each other player, if it's winner stays on -->
                <li v-for="f in p.fixtures" class="text-sm">
                    <MatchText
                        :phaseId="p.id"
                        :fixture="f"
                        :playerId="props.playerId" />
                </li>
            </ul>
        </div>
    </div>
    <div v-else>
        <span class="text-sm">
            {{ t('playerRecord.noFixturesPlayed') }}
        </span>
    </div>
</template>
