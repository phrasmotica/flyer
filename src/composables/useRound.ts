import { computed, ref } from "vue"

import type { Round } from "../data/Round"

export const useRound = (r: Round) => {
    const round = ref(r)

    const name = computed(() => round.value.name)
    const fixtures = computed(() => round.value.fixtures)

    const status = computed(() => {
        if (fixtures.value.every(f => f.startTime && f.finishTime)) {
            return RoundStatus.Finished
        }

        if (fixtures.value.some(f => f.startTime)) {
            return RoundStatus.InProgress
        }

        if (fixtures.value.every(f => f.scores.every(s => !!s.playerId))) {
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
}
