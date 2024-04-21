<script setup lang="ts">
import { computed, onUnmounted, onMounted } from "vue"
import { useI18n } from "vue-i18n"

import TableBadge from "./TableBadge.vue"

import { useFixture } from "@/composables/useFixture"
import { useFixtureList } from "@/composables/useFixtureList"
import { useFlyer } from "@/composables/useFlyer"
import { usePlayers } from "@/composables/usePlayers"
import { useQueryParams } from "@/composables/useQueryParams"
import { useRounds } from "@/composables/useRounds"

import type { Table } from "@/data/Table"
import type { Fixture } from "@/data/Fixture"

import { useFlyerStore } from "@/stores/flyer"

const props = defineProps<{
    table: Table
}>()

const emit = defineEmits<{
    showFixtureModal: [fixture: Fixture]
}>()

const { d, n, t } = useI18n()

const flyerStore = useFlyerStore()

const {
    currentPhase,
} = useFlyer(flyerStore.flyer)

const {
    getFixtureOnTable,
} = useFixtureList(currentPhase.value)

const {
    getPlayerName,
} = usePlayers(currentPhase.value)

const {
    getRound,
} = useRounds(currentPhase.value)

const {
    isHistoric,
} = useQueryParams()

const fixture = computed(() => getFixtureOnTable(props.table.id))

const {
    elapsedMilliseconds,
    resumeClock,
    pauseClock,
} = useFixture("tableSummary", fixture.value, getRound(fixture.value?.id || ""), currentPhase.value)

const fixtureDescription = computed(() => {
    return fixture.value!.scores
        .map(s => getPlayerName(s.playerId) || t("player.unknownIndicator"))
        .join(t("fixture.playerJoiner"))
})

const fixtureClock = computed(() => d(elapsedMilliseconds.value, "clock"))

onMounted(() => {
    if (fixture?.value?.startTime && !fixture.value.finishTime) {
        resumeClock()
    }
})

onUnmounted(() => {
    pauseClock()
})
</script>

<template>
    <div class="flex">
        <div>
            <div>
                <TableBadge :showBusy="!isHistoric" :table="props.table" />
            </div>

            <div>
                <Badge severity="secondary">
                    {{ t('table.costPerHour', {
                        cost: n(props.table.costPerHour, "currency"),
                    }) }}
                </Badge>
            </div>

            <div v-if="fixture" class="cursor-pointer" @click="() => emit('showFixtureModal', fixture!)">
                <Badge severity="secondary">
                    {{ fixtureDescription }} - {{ fixtureClock }}
                </Badge>
            </div>
        </div>
    </div>
</template>
