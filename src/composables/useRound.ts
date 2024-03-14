import { computed, ref } from "vue"

import { useSettings } from "./useSettings"

import type { FlyerSettings } from "../data/FlyerSettings"
import type { Round } from "../data/Round"
import type { Result } from "@/data/Result"

export const useRound = (r: Round, s: FlyerSettings) => {
    const round = ref(r)

    const {
        isWinnerStaysOn,
    } = useSettings(s)

    const name = computed(() => round.value.name)
    const fixtures = computed(() => round.value.fixtures)

    const isPopulated = (f: Result) => f.scores.every(s => s.playerId)

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

    return {
        name,
        fixtures,
        status,
    }
}

export enum RoundStatus {
    Waiting,
    Ready,
    InProgress,
    Finished,
    Cancelled,
}
