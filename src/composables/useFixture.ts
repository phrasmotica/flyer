import { ref, computed, watch } from "vue"
import { useArrayUnique } from "@vueuse/core"
import { differenceInSeconds } from "date-fns"

import { useArray } from "./useArray"
import { useClock } from "./useClock"
import { useRound } from "./useRound"
import { useSettings } from "./useSettings"

import type { Fixture } from "../data/Fixture"
import type { FlyerSettings } from "../data/FlyerSettings"
import { KnockoutScheduler } from "../data/KnockoutScheduler"
import type { Round } from "../data/Round"
import { RoundRobinScheduler } from "../data/RoundRobinScheduler"
import { WinnerStaysOnScheduler } from "../data/WinnerStaysOnScheduler"

// LOW: ideally this would not have to accept undefined, but we use it in places
// where the argument can currently be undefined (see FixtureModal.vue)
export const useFixture = (name: string, f: Fixture | undefined, r: Round | undefined, s: FlyerSettings) => {
    const fixture = ref(f)

    const {
        clockable,
        elapsedSeconds,
        pauseClock,
        resumeClock,
    } = useClock("FixtureClock " + name, fixture.value || null)

    const {
        round,
        raceTo,
    } = useRound(r, s)

    const {
        settings,
        isKnockout,
        isRoundRobin,
        isWinnerStaysOn,
        isVariableMatchLength,
    } = useSettings(s)

    const breakerId = ref("")

    const {
        arr: scores,
        set: setScore,
    } = useArray(fixture.value?.scores.map(s => s.score))

    const uniqueScores = useArrayUnique(scores)

    const {
        arr: runouts,
        set: setRunouts,
    } = useArray(fixture.value?.scores.map(s => s.runouts))

    const comment = ref(fixture.value?.comment || "")

    const players = computed(() => fixture.value?.scores.map(s => s.playerId) || [])
    const isWalkover = computed(() => fixture.value?.scores.some(s => s.isBye) || false)

    const isDraw = computed(() => uniqueScores.value.length <= 1)

    const hasStarted = computed(() => !!fixture.value?.startTime)
    const hasFinished = computed(() => !!fixture.value?.finishTime)
    const isInProgress = computed(() => hasStarted.value && !hasFinished.value)

    const canBeFinished = computed(() => {
        if (scores.value.every(s => s < raceTo.value)) {
            return false
        }

        if (scores.value.reduce((a, b) => a + b) > 2 * raceTo.value - 1) {
            return false
        }

        if (!settings.value.allowDraws && isDraw.value) {
            return false
        }

        return true
    })

    const estimatedDuration = computed(() => {
        const actualRaceTo = isVariableMatchLength.value ? raceTo.value : settings.value.raceTo
        const meanFrames = (actualRaceTo + (2 * actualRaceTo - 1)) / 2

        // TODO: move this logic into a method on the Scheduler classes
        if (isKnockout.value) {
            return new KnockoutScheduler(settings.value).frameTimeEstimateMins * 60 * meanFrames
        }

        if (isRoundRobin.value) {
            return new RoundRobinScheduler(settings.value.stageCount).frameTimeEstimateMins * 60 * meanFrames
        }

        if (isWinnerStaysOn.value) {
            return new WinnerStaysOnScheduler(settings.value.winsRequired).frameTimeEstimateMins * 60 * meanFrames
        }

        throw `Invalid flyer format ${settings.value.format}!`
    })

    const durationSeconds = computed(() => {
        if (!fixture.value?.startTime || !fixture.value.finishTime) {
            return null
        }

        return differenceInSeconds(fixture.value.finishTime, fixture.value.startTime)
    })

    const winner = computed(() => {
        if (!fixture.value) {
            return ""
        }

        if (!hasStarted.value || !hasFinished.value) {
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
            setScore(i, i === index ? settings.value.raceTo : 0)
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
        raceTo,
        scores,
        runouts,
        comment,
        players,
        isWalkover,
        elapsedSeconds,
        hasStarted,
        hasFinished,
        isInProgress,
        canBeFinished,
        estimatedDuration,
        durationSeconds,
        winner,
        getOpponent,
        setWinner,
        setRanOut,
        pauseClock,
        resumeClock,
    }
}
