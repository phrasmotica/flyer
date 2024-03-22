import { ref, computed, watch } from "vue"
import { useArrayUnique, useIntervalFn } from "@vueuse/core"
import { differenceInSeconds } from "date-fns"

import { useArray } from "./useArray"
import { useSettings } from "./useSettings"

import type { Fixture } from "../data/Fixture"
import type { FlyerSettings } from "../data/FlyerSettings"

// LOW: ideally this would not have to accept undefined, but we use it in places
// where the argument can currently be undefined (see FixtureModal.vue)
export const useFixture = (name: string, f: Fixture | undefined, s: FlyerSettings) => {
    const fixture = ref(f)

    const {
        settings,
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

    const startTime = computed(() => fixture.value?.startTime)
    const players = computed(() => fixture.value?.scores.map(s => s.playerId) || [])
    const isWalkover = computed(() => fixture.value?.scores.some(s => s.isBye) || false)

    const isDraw = computed(() => uniqueScores.value.length <= 1)

    const hasStarted = computed(() => !!fixture.value?.startTime)
    const hasFinished = computed(() => !!fixture.value?.finishTime)
    const isInProgress = computed(() => hasStarted.value && !hasFinished.value)

    const canBeFinished = computed(() => {
        if (scores.value.every(s => s < settings.value.raceTo)) {
            return false
        }

        if (scores.value.reduce((a, b) => a + b) > 2 * settings.value.raceTo - 1) {
            return false
        }

        if (!settings.value.allowDraws && isDraw.value) {
            return false
        }

        return true
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

    const computeDifference = () => differenceInSeconds(Date.now(), startTime.value || Date.now())

    const elapsedSeconds = ref(computeDifference())

    const updateClock = () => {
        const newValue = computeDifference()
        console.debug("FixtureClock " + name + ": " + startTime.value + " + " + newValue)
        elapsedSeconds.value = newValue
    }

    watch(fixture, () => {
        updateClock()

        scores.value = fixture.value?.scores.map(s => s.score) || []
        runouts.value = fixture.value?.scores.map(s => s.runouts) || []
        comment.value = fixture.value?.comment || ""

        if (fixture.value?.startTime) {
            clock.resume()
        }
    })

    const clock = useIntervalFn(updateClock, 1000, {
        immediate: false,
    })

    const setWinner = (index: number, clearRunouts: boolean) => {
        scores.value.forEach((_, i) =>{
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

    const pauseClock = clock.pause
    const resumeClock = clock.resume

    return {
        fixture,
        breakerId,
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
        durationSeconds,
        winner,
        getOpponent,
        setWinner,
        setRanOut,
        pauseClock,
        resumeClock,
    }
}
