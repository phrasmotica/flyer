import { computed, ref, watch } from "vue"
import { useIntervalFn } from "@vueuse/core"
import { differenceInMinutes, differenceInSeconds } from "date-fns"

import { RoundStatus } from "./useRound"
import { useSettings } from "./useSettings"

import type { Fixture } from "../data/Fixture"
import { type FlyerSettings } from "../data/FlyerSettings"
import type { Phase } from "../data/Phase"

// LOW: ideally this would not have to accept null, but we use it in places
// where the argument can currently be null (see ResultsTable.vue)
export const usePhase = (p: Phase | null) => {
    const phase = ref(p)

    const fixtures = computed(() => phase.value?.rounds.flatMap(r => r.fixtures) || [])
    const players = computed(() => phase.value?.players || [])
    const tables = computed(() => phase.value?.tables || [])
    const settings = computed(() => phase.value?.settings || <FlyerSettings>{})
    const rounds = computed(() => phase.value?.rounds || [])

    const {
        costPerHour,
    } = useSettings(settings.value)

    const hasStarted = computed(() => !!phase.value?.startTime)
    const hasFinished = computed(() => !!phase.value?.finishTime)
    const isInProgress = computed(() => hasStarted.value && !hasFinished.value)

    const isComplete = computed(() => fixtures.value.every(x => x.startTime && x.finishTime))
    const remainingCount = computed(() => fixtures.value.filter(f => !f.finishTime && !f.cancelledTime).length)

    const currentRound = computed(() => {
        const startedRounds = [...rounds.value.filter(r => r.fixtures.some(f => f.startTime))]

        startedRounds.sort((r, s) => {
            const startTime1 = r.fixtures.map(f => f.startTime!).reduce((t1, t2) => Math.min(t1, t2))
            const startTime2 = s.fixtures.map(f => f.startTime!).reduce((t1, t2) => Math.min(t1, t2))
            return startTime1 - startTime2
        })

        return startedRounds[0]
    })

    const nextRound = computed(() => {
        const currentRoundIdx = rounds.value.findIndex(r => r.index === currentRound.value.index)
        return rounds.value[currentRoundIdx + 1]
    })

    const generationIsComplete = computed(() => rounds.value.every(r => r.isGenerated))

    const readyForNextRound = computed(() => {
        if (!settings.value.randomlyDrawAllRounds) {
            return false
        }

        // don't want to include the always-generated final round, so
        // use a take-while approach
        const generatedRounds = takeWhile([...rounds.value], r => r.isGenerated)
        if (generatedRounds.length >= rounds.value.length) {
            return false
        }

        return currentRound.value.fixtures.every(f => f.startTime && f.finishTime)
    })

    const durationMinutes = computed(() => {
        if (!phase.value?.startTime || !phase.value.finishTime) {
            return null
        }

        return differenceInMinutes(phase.value.finishTime, phase.value.startTime)
    })

    const durationSeconds = computed(() => {
        if (!phase.value?.startTime || !phase.value.finishTime) {
            return null
        }

        return differenceInSeconds(phase.value.finishTime, phase.value.startTime)
    })

    const clockDisplay = computed(() => durationSeconds.value || elapsedSeconds.value)

    const totalCost = computed(() => {
        const durationHours = (durationSeconds.value || elapsedSeconds.value) / 3600
        return costPerHour.value * durationHours
    })

    const nextFreeTable = computed(() => {
        const freeTables = tables.value.filter(t => !fixtures.value.some(f => f.tableId === t.id && !f.finishTime))
        return freeTables.at(0)
    })

    const canStartFixture = (fixture: Fixture | undefined, currentRoundStatus: RoundStatus) => {
        return getFixtureStatus(fixture, currentRoundStatus) === FixtureStatus.ReadyToStart
    }

    const isBusy = (playerId: string) => {
        return rounds.value.flatMap(r => r.fixtures).some(f => {
            const isInProgress = f.startTime && !f.finishTime
            return isInProgress && f.scores.some(s => s.playerId === playerId)
        })
    }

    const getPlayerName = (id: string) => players.value.find(p => p.id === id)?.name ?? id

    const getTableName = (id: string) => tables.value.find(p => p.id === id)?.name ?? id

    const getRound = (fixtureId: string) => rounds.value.find(r => r.fixtures.some(f => f.id === fixtureId))

    const getFixtureStatus = (fixture: Fixture | undefined, currentRoundStatus: RoundStatus) => {
        if (!fixture) {
            return FixtureStatus.Unknown
        }

        if (fixture.scores.some(s => !s.playerId)) {
            if (settings.value.randomlyDrawAllRounds) {
                return FixtureStatus.WaitingForRoundGeneration
            }

            return FixtureStatus.WaitingForPreviousResult
        }

        if (fixture.scores.some(s => isBusy(s.playerId))) {
            return FixtureStatus.WaitingForPlayers
        }

        const round = getRound(fixture.id)
        const currentRoundNotFinished = currentRoundStatus !== RoundStatus.Finished
        if (settings.value.requireCompletedRounds && currentRoundNotFinished && (round?.index || -1) > currentRound.value.index) {
            return FixtureStatus.WaitingForRound
        }

        if (!nextFreeTable.value) {
            return FixtureStatus.WaitingForTable
        }

        return FixtureStatus.ReadyToStart
    }

    const getFixtureDescription = (fixture: Fixture | undefined) => {
        if (!fixture) {
            return "???"
        }

        return fixture.scores.map(s => {
            if (s.isBye) {
                return "(bye)"
            }

            return getPlayerName(s.playerId)
        }).join(" v ")
    }

    const getFixtureHeader = (fixture: Fixture | undefined) => {
        return `${getRound(fixture?.id || "")?.name || "???"} - ${getFixtureDescription(fixture)}`
    }

    const computeDifference = () => differenceInSeconds(Date.now(), phase.value?.startTime || Date.now())

    const elapsedSeconds = ref(computeDifference())

    const updateClock = () => {
        const newValue = computeDifference()
        console.debug("PhaseClock " + settings.value.name + ": " + phase.value?.startTime + " + " + newValue)
        elapsedSeconds.value = newValue
    }

    watch(phase, () => {
        updateClock()

        if (phase.value?.startTime) {
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
        phase,

        fixtures,
        players,
        settings,
        rounds,

        elapsedSeconds,
        hasStarted,
        hasFinished,
        isInProgress,
        isComplete,
        remainingCount,
        currentRound,
        nextRound,
        generationIsComplete,
        readyForNextRound,
        durationMinutes,
        durationSeconds,
        clockDisplay,
        totalCost,
        nextFreeTable,

        canStartFixture,
        isBusy,
        getPlayerName,
        getTableName,
        getRound,
        getFixtureStatus,
        getFixtureHeader,
        pauseClock,
        resumeClock,
    }
}

export enum FixtureStatus {
    Unknown,
    WaitingForRoundGeneration,
    WaitingForPreviousResult,
    WaitingForPlayers,
    WaitingForRound,
    WaitingForTable,
    ReadyToStart,
}
