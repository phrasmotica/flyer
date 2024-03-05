import { computed, ref, watch } from "vue"
import { useIntervalFn } from "@vueuse/core"
import { differenceInSeconds } from "date-fns"

import type { Flyer } from "../data/Flyer"
import { Format, TieBreaker } from "../data/FlyerSettings"
import type { Result } from "../data/Result"

export const useFlyer = (f: Flyer) => {
    const flyer = ref(f)

    const results = computed(() => flyer.value.rounds.flatMap(r => r.fixtures))
    const players = computed(() => flyer.value.players)
    const settings = computed(() => flyer.value.settings)
    const rounds = computed(() => flyer.value?.rounds ?? [])

    const hasStarted = computed(() => !!flyer.value.startTime)
    const hasFinished = computed(() => !!flyer.value.finishTime)
    const isInProgress = computed(() => hasStarted.value && !hasFinished.value)
    const isComplete = computed(() => {
        return flyer.value.rounds.flatMap(r => r.fixtures).every(x => x.startTime && x.finishTime)
    })

    const ongoingCount = computed(() => results.value.filter(f => f.startTime && !f.finishTime).length)
    const remainingCount = computed(() => results.value.filter(f => !f.finishTime).length)

    const currentRound = computed(() => {
        const oldestInProgressRound = rounds.value.find(r => r.fixtures.some(f => !f.finishTime))
        if (!oldestInProgressRound) {
            return 0
        }

        return oldestInProgressRound.index
    })

    const generationIsComplete = computed(() => rounds.value.every(r => r.isGenerated))

    const readyForNextRound = computed(() => {
        if (!f.settings.randomlyDrawAllRounds) {
            return false
        }

        const rounds = [...flyer.value.rounds]

        // don't want to include the always-generated final round, so
        // use a take-while approach
        const generatedRounds = takeWhile(rounds, r => r.isGenerated)
        if (generatedRounds.length >= rounds.length) {
            return false
        }

        const currentRound = generatedRounds[generatedRounds.length - 1]
        return currentRound.fixtures.every(f => f.startTime && f.finishTime)
    })

    const durationSeconds = computed(() => {
        if (!hasStarted.value || !hasFinished.value) {
            return null
        }

        return Math.floor((flyer.value.finishTime! - flyer.value.startTime!) / 1000)
    })

    const usesPlayOff = computed(() => {
        return settings.value.tieBreaker === TieBreaker.PlayOff
            && settings.value.format === Format.RoundRobin
    })

    const winner = computed(() => {
        if (!flyer.value?.startTime || !flyer.value.finishTime) {
            return null
        }

        const finalRound = rounds.value[rounds.value.length - 1]
        if (finalRound) {
            const final = finalRound.fixtures[finalRound.fixtures.length - 1]
            const id = getWinner(final).playerId
            return players.value.find(p => p.id === id) || null
        }

        return null
    })

    const winnerResults = computed(() => {
        if (!winner.value) {
            return []
        }

        const winnerResults = results.value.filter(r => r.scores.some(s => s.playerId === winner.value!.id))

        // ensures reverse chronological order
        return winnerResults.reverse()
    })

    const clockDisplay = computed(() => durationSeconds.value || elapsedSeconds.value)

    const getWinner = (f: Result) => f.scores.reduce((s, t) => s.score > t.score ? s : t)

    const isBusy = (playerId: string) => {
        return flyer.value.rounds.flatMap(r => r.fixtures).some(f => {
            const isInProgress = f.startTime && !f.finishTime
            return isInProgress && f.scores.some(s => s.playerId === playerId)
        })
    }

    const getPlayerName = (id: string) => players.value.find(p => p.id === id)?.name ?? id

    const getRound = (resultId: string) => rounds.value.find(r => r.fixtures.some(f => f.id === resultId))

    const getRoundStatus = (index: number) => {
        const round = flyer.value.rounds.find(r => r.index === index)
        if (!round) {
            throw `Round ${index} not found!`
        }

        if (round.fixtures.every(f => f.startTime && f.finishTime)) {
            return RoundStatus.Finished
        }

        if (round.fixtures.some(f => f.startTime)) {
            return RoundStatus.InProgress
        }

        if (round.fixtures.every(f => f.scores.every(s => !!s.playerId))) {
            return RoundStatus.Ready
        }

        return RoundStatus.Waiting
    }

    const playOffIsComplete = (id: string) => {
        return flyer.value.playOffs.some(p => p.id === id)
    }

    const computeDifference = () => differenceInSeconds(Date.now(), flyer.value.startTime || Date.now())

    const elapsedSeconds = ref(computeDifference())

    const updateClock = () => {
        const newValue = computeDifference()
        console.debug("FlyerClock " + flyer.value.settings.name + ": " + flyer.value.startTime + " + " + newValue)
        elapsedSeconds.value = newValue
    }

    watch(flyer, () => {
        updateClock()

        if (flyer.value.startTime) {
            resumeClock()
        }
    })

    const clock = useIntervalFn(updateClock, 1000, {
        immediate: false,
    })

    const pauseClock = clock.pause
    const resumeClock = clock.resume

    const takeWhile = <T>(arr: T[], pred: (x: T) => boolean): T[] => {
        if (arr.length <= 0) {
            return []
        }

        return pred(arr[0]) ? [arr[0], ...takeWhile(arr.slice(1, -1), pred)] : []
    }

    return {
        flyer,

        results,
        players,
        settings,
        rounds,
        elapsedSeconds,
        hasStarted,
        hasFinished,
        isInProgress,
        isComplete,
        ongoingCount,
        remainingCount,
        currentRound,
        generationIsComplete,
        readyForNextRound,
        durationSeconds,
        usesPlayOff,
        winner,
        winnerResults,
        clockDisplay,

        isBusy,
        getPlayerName,
        getRound,
        getRoundStatus,
        playOffIsComplete,
        pauseClock,
        resumeClock,
    }
}

export enum RoundStatus {
    Waiting,
    Ready,
    InProgress,
    Finished,
}
