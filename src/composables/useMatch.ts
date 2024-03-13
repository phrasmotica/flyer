import { ref, computed, watch } from "vue"
import { useArrayUnique, useIntervalFn } from "@vueuse/core"
import { differenceInSeconds } from "date-fns"

import type { Result } from "../data/Result"

// LOW: ideally this would not have to accept undefined, but we use it in places
// where the argument can currently be undefined (see RecordResultModal.vue)
export const useMatch = (name: string, f: Result | undefined) => {
    const result = ref(f)

    const scores = ref(result.value?.scores.map(r => r.score) || [])
    const uniqueScores = useArrayUnique(scores)

    const runouts = ref(result.value?.scores.map(r => r.runouts) || [])
    const comment = ref(result.value?.comment || "")

    const startTime = computed(() => result.value?.startTime)
    const players = computed(() => result.value?.scores.map(r => r.playerId) || [])
    const isWalkover = computed(() => result.value?.scores.some(s => s.isBye) || false)

    const isDraw = computed(() => uniqueScores.value.length <= 1)

    const hasStarted = computed(() => !!result.value?.startTime)
    const hasFinished = computed(() => !!result.value?.finishTime)
    const isInProgress = computed(() => hasStarted.value && !hasFinished.value)

    const durationSeconds = computed(() => {
        if (!result.value?.startTime || !result.value.finishTime) {
            return null
        }

        return differenceInSeconds(result.value.finishTime, result.value.startTime)
    })

    const winner = computed(() => {
        if (!result.value) {
            return ""
        }

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

    const getOpponent = (playerId: string) => {
        const opponentScore = result.value?.scores.find(s => s.playerId !== playerId)
        return opponentScore?.playerId || ""
    }

    const computeDifference = () => differenceInSeconds(Date.now(), startTime.value || Date.now())

    const elapsedSeconds = ref(computeDifference())

    const updateClock = () => {
        const newValue = computeDifference()
        console.debug("MatchClock " + name + ": " + startTime.value + " + " + newValue)
        elapsedSeconds.value = newValue
    }

    watch(result, () => {
        updateClock()

        scores.value = result.value?.scores.map(r => r.score) || []
        runouts.value = result.value?.scores.map(r => r.runouts) || []
        comment.value = result.value?.comment || ""

        if (result.value?.startTime) {
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
        result,
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
