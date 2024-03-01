import { ref, computed, watch } from "vue"
import { useIntervalFn } from "@vueuse/core"
import { differenceInSeconds } from "date-fns"

import type { Result } from "../data/Result"

export const useMatch = (name: string, f: Result) => {
    const result = ref(f)
    const scores = ref(f.scores.map(r => r.score))

    const startTime = computed(() => result.value.startTime)
    const players = computed(() => result.value.scores.map(r => r.playerId))

    const hasStarted = computed(() => !!result.value.startTime)
    const hasFinished = computed(() => !!result.value.finishTime)
    const isInProgress = computed(() => hasStarted.value && !hasFinished.value)

    const durationSeconds = computed(() => {
        if (!hasStarted.value || !hasFinished.value) {
            return null
        }

        return Math.floor((result.value.finishTime! - result.value.startTime!) / 1000)
    })

    const winner = computed(() => {
        if (!hasStarted.value || !hasFinished.value) {
            return ""
        }

        const winningScore = result.value.scores.reduce((s, t) => {
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

    const computeDifference = () => differenceInSeconds(Date.now(), startTime.value || Date.now())

    const elapsedSeconds = ref(computeDifference())

    const updateClock = () => {
        const newValue = computeDifference()
        console.debug("MatchClock " + name + ": " + startTime.value + " + " + newValue)
        elapsedSeconds.value = newValue
    }

    watch(result, () => {
        updateClock()

        scores.value = result.value.scores.map(r => r.score)

        if (result.value.startTime) {
            clock.resume()
        }
    })

    const clock = useIntervalFn(updateClock, 1000, {
        immediate: false,
    })

    const setScore = (index: number, score: number) => {
        scores.value = scores.value.map((s, i) => i === index ? score : s)
    }

    const pauseClock = clock.pause
    const resumeClock = clock.resume

    return {
        result,
        scores,
        players,
        elapsedSeconds,
        hasStarted,
        hasFinished,
        isInProgress,
        durationSeconds,
        winner,
        setScore,
        pauseClock,
        resumeClock,
    }
}
