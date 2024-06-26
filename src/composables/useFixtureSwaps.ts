import { computed, watch } from "vue"

import { useArray } from "./useArray"
import { useFixtureList } from "./useFixtureList"
import { usePhase } from "./usePhase"
import { usePhaseEvents } from "./usePhaseEvents"
import { useRounds } from "./useRounds"
import { usePhaseSpecification } from "./useSpecification"

import type { FixtureSwap } from "@/data/FixtureSwap"
import type { Phase } from "@/data/Phase"
import type { Round } from "@/data/Round"

import { useFlyerStore } from "@/stores/flyer"

export const useFixtureSwaps = (p: Phase | null) => {
    const {
        phase,
        nextFreeFixture,
    } = usePhase(p)

    const {
        nextFixture,
    } = useFixtureList(phase.value)

    const {
        getRound,
    } = useRounds(phase.value)

    const {
        isRoundRobin,
    } = usePhaseSpecification(phase.value)

    const {
        push: acknowledgeSwap,
        includes: alreadyAcknowledgedSwap,
    } = useArray<string>()

    const flyerStore = useFlyerStore()

    const phaseEvents = usePhaseEvents(phase.value)

    const fixtureSwaps = computed(() => phase.value?.fixtureSwaps || [])

    const unacknowledgedSwap = computed(() => {
        const lastSwap = fixtureSwaps.value.at(-1)
        if (!lastSwap || alreadyAcknowledgedSwap(lastSwap.id)) {
            return null
        }

        return lastSwap
    })

    const getRoundWithIndex = (fixtureId: string): [Round | undefined, number] => {
        const round = getRound(fixtureId)
        return [round, round?.fixtures.findIndex(f => f.id === fixtureId) ?? -1]
    }

    watch(nextFixture, () => {
        swapIfNeeded()
    })

    const getFixtureSwap = (): FixtureSwap | null => {
        if (!phase.value || !isRoundRobin.value || !nextFixture.value || !nextFreeFixture.value) {
            return null
        }

        const [roundA, fixtureIndexA] = getRoundWithIndex(nextFixture.value.id)
        const [roundB, fixtureIndexB] = getRoundWithIndex(nextFreeFixture.value.id)

        if (!roundA || !roundB) {
            return null
        }

        if (roundA.index === roundB.index && fixtureIndexA === fixtureIndexB) {
            return null
        }

        return {
            id: "",

            roundAIndex: roundA.index,
            fixtureAIndex: fixtureIndexA,
            fixtureAId: nextFixture.value.id,

            roundBIndex: roundB.index,
            fixtureBIndex: fixtureIndexB,
            fixtureBId: nextFreeFixture.value.id,

            timestamp: 0,
        }
    }

    const swapIfNeeded = () => {
        const swap = getFixtureSwap()
        if (swap) {
            // generate this now - the computed properties update after the swap...
            const message = phaseEvents.fixturesSwapped(swap)

            // if necessary, swap the next fixture in the current round (or
            // the first fixture in the next round) with the first upcoming fixture
            // where all players are free
            const didSwap = flyerStore.swapFixtures(phase.value!, swap)
            if (didSwap) {
                flyerStore.addPhaseEvent(phase.value!, message)
            }
        }
    }

    return {
        fixtureSwaps,
        unacknowledgedSwap,

        acknowledgeSwap,
    }
}
