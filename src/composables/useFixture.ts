import { ref, computed, watch } from "vue"
import { useArrayUnique } from "@vueuse/core"
import { differenceInMilliseconds } from "date-fns"

import { useArray } from "./useArray"
import { useClock } from "./useClock"
import { useRound } from "./useRound"
import { useScheduler } from "./useScheduler"
import { usePhaseSpecification } from "./useSpecification"

import type { Fixture } from "@/data/Fixture"
import type { Phase } from "@/data/Phase"
import type { Round } from "@/data/Round"

// LOW: ideally this would not have to accept undefined, but we use it in places
// where the argument can currently be undefined (see FixtureModal.vue)
export const useFixture = (name: string, f: Fixture | undefined, r: Round | undefined, p: Phase | null) => {
    const fixture = ref(f)

    const {
        clockable,
        elapsedMilliseconds,
        pauseClock,
        resumeClock,
    } = useClock("FixtureClock " + name, fixture.value || null)

    const {
        round,
        raceTo,
    } = useRound(r, p)

    const {
        settings,
        bestOf,
        isKnockout,
        isRoundRobin,
        fixturesCanBeDrawn,
    } = usePhaseSpecification(p)

    const {
        scheduler,
    } = useScheduler(settings.value)

    const breakerId = ref("")
    const tableId = ref("")

    const {
        arr: scores,
        set: setScore,
    } = useArray(fixture.value?.scores.map(s => s.score))

    const uniqueProvisionalScores = useArrayUnique(scores)
    const uniqueScores = useArrayUnique(() => fixture.value?.scores.map(s => s.score) || [])

    const {
        arr: runouts,
        set: setRunouts,
    } = useArray(fixture.value?.scores.map(s => s.runouts))

    const comment = ref(fixture.value?.comment || "")

    const players = computed(() => fixture.value?.scores.map(s => s.playerId) || [])
    const isWalkover = computed(() => fixture.value?.scores.some(s => s.isBye) || false)

    const areDrawing = computed(() => uniqueProvisionalScores.value.length <= 1)

    const hasStarted = computed(() => !!fixture.value?.startTime)
    const hasFinished = computed(() => !!fixture.value?.finishTime)
    const isInProgress = computed(() => hasStarted.value && !hasFinished.value)

    const maxFrames = computed(() => {
        if (isKnockout.value) {
            return 2 * raceTo.value - 1
        }

        if (isRoundRobin.value) {
            return bestOf.value
        }

        return 1
    })

    const canBeFinished = computed(() => {
        const framesPlayed = scores.value.reduce((a, b) => a + b)

        if (framesPlayed > maxFrames.value) {
            return false
        }

        if (fixturesCanBeDrawn.value && areDrawing.value && framesPlayed === maxFrames.value) {
            return true
        }

        if (scores.value.every(s => s < raceTo.value)) {
            return false
        }

        return true
    })

    const estimatedDurationMilliseconds = computed(() => {
        return scheduler.value.estimateFixtureDuration(raceTo.value)
    })

    const durationMilliseconds = computed(() => {
        if (!fixture.value?.startTime || !fixture.value.finishTime) {
            return null
        }

        return differenceInMilliseconds(fixture.value.finishTime, fixture.value.startTime)
    })

    const winner = computed(() => {
        if (!fixture.value) {
            return ""
        }

        if (!hasStarted.value || !hasFinished.value) {
            return ""
        }

        if (isDraw.value) {
            return ""
        }

        const winningScore = fixture.value.scores.reduce((s, t) => {
            if (s.isBye && !t.isBye) {
                return t
            }

            if (!s.isBye && t.isBye) {
                return s
            }

            return s.score > t.score ? s : t
        })

        return winningScore.playerId
    })

    const isDraw = computed(() => {
        if (!fixture.value) {
            return false
        }

        if (!hasStarted.value || !hasFinished.value) {
            return false
        }

        return uniqueScores.value.length <= 1
    })

    const getOpponent = (playerId: string) => {
        const opponentScore = fixture.value?.scores.find(s => s.playerId !== playerId)
        return opponentScore?.playerId || ""
    }

    watch(fixture, () => {
        clockable.value = fixture.value || null

        scores.value = fixture.value?.scores.map(s => s.score) || []
        runouts.value = fixture.value?.scores.map(s => s.runouts) || []
        comment.value = fixture.value?.comment || ""
    })

    const setWinner = (index: number, clearRunouts: boolean) => {
        scores.value.forEach((_, i) => {
            setScore(i, i === index ? raceTo.value : 0)
        })

        if (clearRunouts) {
            runouts.value = runouts.value.map(_ => 0)
        }
    }

    const setRanOut = (index: number) => {
        runouts.value.forEach((r, i) => {
            setRunouts(i, i === index && r <= 0 ? 1 : 0)
        })

        setWinner(index, false)
    }

    return {
        fixture,
        round,
        breakerId,
        tableId,
        raceTo,
        scores,
        runouts,
        comment,
        players,
        isWalkover,
        elapsedMilliseconds,
        hasStarted,
        hasFinished,
        isInProgress,
        canBeFinished,
        estimatedDurationMilliseconds,
        durationMilliseconds,
        winner,
        isDraw,
        getOpponent,
        setWinner,
        setRanOut,
        pauseClock,
        resumeClock,
    }
}
