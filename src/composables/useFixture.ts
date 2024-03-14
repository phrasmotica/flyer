import { ref, computed, watch } from "vue"
import { useArrayUnique, useIntervalFn } from "@vueuse/core"
import { differenceInSeconds } from "date-fns"

import type { Fixture } from "../data/Fixture"

// LOW: ideally this would not have to accept undefined, but we use it in places
// where the argument can currently be undefined (see FixtureModal.vue)
export const useFixture = (name: string, f: Fixture | undefined) => {
    const fixture = ref(f)

    const scores = ref(fixture.value?.scores.map(s => s.score) || [])
    const uniqueScores = useArrayUnique(scores)

    const runouts = ref(fixture.value?.scores.map(s => s.runouts) || [])
    const comment = ref(fixture.value?.comment || "")

    const startTime = computed(() => fixture.value?.startTime)
    const players = computed(() => fixture.value?.scores.map(s => s.playerId) || [])
    const isWalkover = computed(() => fixture.value?.scores.some(s => s.isBye) || false)

    const isDraw = computed(() => uniqueScores.value.length <= 1)

    const hasStarted = computed(() => !!fixture.value?.startTime)
    const hasFinished = computed(() => !!fixture.value?.finishTime)
    const isInProgress = computed(() => hasStarted.value && !hasFinished.value)

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

    const setScore = (index: number, score: number) => {
        scores.value = scores.value.map((s, i) => i === index ? score : s)
    }

    const setRunouts = (index: number, r: number) => {
        runouts.value = runouts.value.map((s, i) => i === index ? r : s)
    }

    const clearRunouts = () => {
        runouts.value = runouts.value.map(_ => 0)
    }

    const pauseClock = clock.pause
    const resumeClock = clock.resume

    return {
        fixture,
        scores,
        runouts,
        comment,
        players,
        isDraw,
        isWalkover,
        elapsedSeconds,
        hasStarted,
        hasFinished,
        isInProgress,
        durationSeconds,
        winner,
        getOpponent,
        setScore,
        setRunouts,
        clearRunouts,
        pauseClock,
        resumeClock,
    }
}
