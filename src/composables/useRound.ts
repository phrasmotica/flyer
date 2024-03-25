import { computed, ref } from "vue"

import { useRankings } from "./useRankings"
import { useSettings } from "./useSettings"

import type { Fixture } from "../data/Fixture"
import type { FlyerSettings } from "../data/FlyerSettings"
import type { Round } from "../data/Round"

export const useRound = (r: Round | undefined, s: FlyerSettings) => {
    const round = ref(r)

    const {
        getWinner,
    } = useRankings()

    const {
        isWinnerStaysOn,
    } = useSettings(s)

    const name = computed(() => round.value?.name || "")
    const fixtures = computed(() => round.value?.fixtures || [])
    const raceTo = computed(() => round.value?.raceTo || s.raceTo)

    const raceToSummary = computed(() => `Races to ${raceTo.value}`)

    const playableFixtures = computed(() => {
        if (isWinnerStaysOn.value) {
            return fixtures.value.filter(isPopulated)
        }

        return fixtures.value.filter(f => f.scores.every(s => !s.isBye))
    })

    const status = computed(() => {
        if (fixtures.value.every(f => f.cancelledTime)) {
            return RoundStatus.Cancelled
        }

        if (fixtures.value.every(f => (f.startTime && f.finishTime) || f.cancelledTime)) {
            return RoundStatus.Finished
        }

        if (playableFixtures.value.some(f => f.startTime)) {
            return RoundStatus.InProgress
        }

        if (playableFixtures.value.length > 0 && playableFixtures.value.every(isPopulated)) {
            return RoundStatus.Ready
        }

        return RoundStatus.Waiting
    })

    const winners = computed(() => fixtures.value.map(f => getWinner(f) || ""))

    const isPopulated = (f: Fixture) => f.scores.every(s => s.playerId)

    return {
        round,
        name,
        fixtures,
        raceTo,
        raceToSummary,
        status,
        winners,
    }
}

export enum RoundStatus {
    Waiting,
    Ready,
    InProgress,
    Finished,
    Cancelled,
}
