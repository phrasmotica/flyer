<script setup lang="ts">
import { computed } from "vue"
import { useI18n } from "vue-i18n"

import MatchText from "./MatchText.vue"

import { useFixtureList } from "@/composables/useFixtureList"
import { useFlyer } from "@/composables/useFlyer"

import { useFlyerStore } from "@/stores/flyer"

const { t } = useI18n()

const props = defineProps<{
    playerId: string
}>()

const flyerStore = useFlyerStore()

const {
    mainPhase,
} = useFlyer(flyerStore.flyer)

const {
    getFixtures,
} = useFixtureList(mainPhase.value)

const fixtures = computed(() => getFixtures(props.playerId).filter(f => f.finishTime))
</script>

<template>
    <div v-if="fixtures.length > 0">
        <ul class="m-0">
            <li v-for="f in fixtures" class="text-sm">
                <MatchText :playerId="props.playerId" :fixture="f" />
            </li>
        </ul>
    </div>
    <div v-else>
        <span class="text-sm">
            {{ t('playerRecord.noFixturesPlayed') }}
        </span>
    </div>
</template>
