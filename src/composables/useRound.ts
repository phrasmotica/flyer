import { computed, ref } from "vue"

import { usePhase } from "./usePhase"
import { usePhaseSettings } from "./usePhaseSettings"
import { useRankings } from "./useRankings"

import type { Fixture } from "@/data/Fixture"
import type { Phase } from "@/data/Phase"
import type { Round } from "@/data/Round"

export const useRound = (r: Round | undefined, p: Phase | null) => {
    const round = ref(r)

    const {
        getWinner,
    } = useRankings()

    const {
        settings,
    } = usePhase(p)

    const {
        isWinnerStaysOn,
    } = usePhaseSettings(settings.value)

    const name = computed(() => round.value?.name)
    const fixtures = computed(() => round.value?.fixtures || [])
    const raceTo = computed(() => round.value?.raceTo || settings.value.raceTo)

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
