import { computed, ref } from "vue"

import type { Fixture } from "@/data/Fixture"
import type { Phase } from "@/data/Phase"

export const useFixtureList = (p: Phase | null) => {
    const phase = ref(p)

    const fixtures = computed(() => phase.value?.rounds.flatMap(r => r.fixtures) || [])

    const isStarted = computed(() => fixtures.value.some(f => f.startTime))

    const isComplete = computed(() => fixtures.value.every(x => x.startTime && x.finishTime))
    const remainingCount = computed(() => fixtures.value.filter(f => !f.finishTime && !f.cancelledTime).length)

    const nextFixture = computed(() => fixtures.value.find(f => !f.tableId))

    const getFixtures = (playerId: string) => {
        return fixtures.value.filter(f => f.scores.some(s => s.playerId === playerId))
    }

    const getFixture = (id: string) => {
        return fixtures.value.find(f => f.id === id)
    }

    const getFixtureOnTable = (tableId: string) => {
        return fixtures.value.find(f => !f.finishTime && f.tableId === tableId)
    }

    const getPossiblePlayers = (fixture: Fixture, slot: number) => {
        const score = fixture.scores[slot]

        if (score.isBye) {
            return []
        }

        if (fixture.parentFixtures[slot]) {
            const parentFixture = fixtures.value.find(f => {
                return fixture.parentFixtures[slot].fixtureId === f.id
            })

            if (parentFixture && parentFixture.scores.every(s => s.playerId)) {
                return parentFixture.scores.map(s => s.playerId)
            }
        }

        return score.playerId ? [score.playerId] : []
    }

    return {
        fixtures,

        isStarted,
        isComplete,
        remainingCount,
        nextFixture,

        getFixtures,
        getFixture,
        getFixtureOnTable,
        getPossiblePlayers,
    }
}
