import { computed, ref, watch } from "vue"
import { differenceInMilliseconds, differenceInMinutes } from "date-fns"

import { useArray } from "./useArray"
import { useClock } from "./useClock"
import { usePhaseSettings } from "./usePhaseSettings"
import { RoundStatus } from "./useRound"
import { useScheduler } from "./useScheduler"

import type { Fixture } from "../data/Fixture"
import type { Phase } from "../data/Phase"
import type { PhaseSettings } from "../data/PhaseSettings"
import type { Round } from "../data/Round"

// LOW: ideally this would not have to accept null, but we use it in places
// where the argument can currently be null (see ResultsTable.vue)
export const usePhase = (p: Phase | null) => {
    const phase = ref(p)

    const {
        push: acknowledgeSwap,
        includes: alreadyAcknowledgedSwap,
    } = useArray<string>()

    const fixtures = computed(() => phase.value?.rounds.flatMap(r => r.fixtures) || [])
    const fixtureSwaps = computed(() => phase.value?.fixtureSwaps || [])
    const players = computed(() => phase.value?.players || [])
    const tables = computed(() => phase.value?.tables || [])

    // LOW: do something better here than casting an empty object to PhaseSettings
    const settings = computed(() => phase.value?.settings || <PhaseSettings>{})

    const {
        clockable,
        elapsedMilliseconds,
        pauseClock,
        resumeClock,
    } = useClock("PhaseClock " + settings.value.name, phase.value)

    const rounds = computed(() => phase.value?.rounds || [])

    const {
        isWinnerStaysOn,
    } = usePhaseSettings(settings.value)

    const {
        scheduler,
    } = useScheduler(settings.value)

    const unacknowledgedSwap = computed(() => {
        const lastSwap = fixtureSwaps.value.at(-1)
        if (!lastSwap || alreadyAcknowledgedSwap(lastSwap.id)) {
            return null
        }

        return lastSwap
    })

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

        return startedRounds[0] || rounds.value[0]
    })

    const nextRoundToGenerate = computed(() => rounds.value.find(r => !r.isGenerated))

    const readyToGenerateNextRound = computed(() => {
        if (!settings.value.randomlyDrawAllRounds) {
            return false
        }

        // don't want to include the always-generated final round, so
        // use a take-while approach
        const generatedRounds = takeWhile([...rounds.value], r => r.isGenerated)
        if (generatedRounds.length >= rounds.value.length) {
            return false
        }

        const lastGeneratedRound = generatedRounds.at(-1)
        return lastGeneratedRound && lastGeneratedRound.fixtures.every(f => f.startTime && f.finishTime)
    })

    const generationIsComplete = computed(() => rounds.value.every(r => r.isGenerated))

    const estimatedDurationMinutes = computed(() => {
        if (!phase.value) {
            return 0
        }

        return scheduler.value.estimateDurationForPhase(phase.value)
    })

    const durationMinutes = computed(() => {
        if (!phase.value?.startTime || !phase.value.finishTime) {
            return null
        }

        return differenceInMinutes(phase.value.finishTime, phase.value.startTime)
    })

    const durationMilliseconds = computed(() => {
        if (!phase.value?.startTime || !phase.value.finishTime) {
            return null
        }

        return differenceInMilliseconds(phase.value.finishTime, phase.value.startTime)
    })

    const clockDisplay = computed(() => durationMilliseconds.value || elapsedMilliseconds.value)

    const costPerHour = computed(() => tables.value.map(t => t.costPerHour).reduce((a, b) => a + b, 0))

    const totalCost = computed(() => {
        const durationHours = (durationMilliseconds.value || elapsedMilliseconds.value) / 3600000
        return costPerHour.value * durationHours
    })

    const freeTables = computed(() => tables.value.filter(t => !fixtures.value.some(f => f.tableId === t.id && !f.finishTime)))

    const maxTableCount = computed(() => {
        if (isWinnerStaysOn.value) {
            return 1
        }

        return Math.floor(players.value.length / 2)
    })

    const nextFixture = computed(() => fixtures.value.find(f => !f.startTime))

    const nextFreeFixture = computed(() => fixtures.value.find(canPrioritiseFixture))

    const canStartFixture = (fixture: Fixture | undefined, currentRoundStatus: RoundStatus) => {
        return getFixtureStatus(fixture, currentRoundStatus) === FixtureStatus.ReadyToStart
    }

    const canPrioritiseFixture = (fixture: Fixture | undefined) => {
        const status = getFixtureStatus(fixture)

        if (settings.value.requireCompletedRounds) {
            return status === FixtureStatus.ReadyToStart
        }

        return [
            FixtureStatus.ReadyToStart,
            FixtureStatus.WaitingForRound,
        ].includes(status)
    }

    const isBusy = (playerId: string) => {
        return rounds.value.flatMap(r => r.fixtures).some(f => {
            const isInProgress = f.startTime && !f.finishTime
            return isInProgress && f.scores.some(s => s.playerId === playerId)
        })
    }

    const getPlayerName = (id: string) => players.value.find(p => p.id === id)?.name || id || "???"

    const getTable = (id: string) => tables.value.find(p => p.id === id)

    const getRound = (fixtureId: string) => rounds.value.find(r => r.fixtures.some(f => f.id === fixtureId))

    const getRoundWithIndex = (fixtureId: string): [Round | undefined, number] => {
        const round = getRound(fixtureId)
        return [round, round?.fixtures.findIndex(f => f.id === fixtureId) ?? -1]
    }

    const getFixtureStatus = (fixture: Fixture | undefined, currentRoundStatus?: RoundStatus) => {
        if (!fixture) {
            return FixtureStatus.Unknown
        }

        if (fixture.finishTime) {
            return FixtureStatus.Finished
        }

        if (fixture.startTime) {
            return FixtureStatus.InProgress
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

        if (currentRoundStatus) {
            const round = getRound(fixture.id)
            const currentRoundNotFinished = currentRoundStatus !== RoundStatus.Finished
            if (settings.value.requireCompletedRounds && currentRoundNotFinished && (round?.index || -1) > currentRound.value.index) {
                return FixtureStatus.WaitingForRound
            }
        }

        if (freeTables.value.length <= 0) {
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

    watch(phase, () => {
        clockable.value = phase.value
    })

    const takeWhile = <T>(arr: T[], pred: (x: T) => boolean): T[] => {
        if (arr.length <= 0) {
            return []
        }

        return pred(arr[0]) ? [arr[0], ...takeWhile(arr.slice(1, -1), pred)] : []
    }

    return {
        phase,

        fixtures,
        fixtureSwaps,
        unacknowledgedSwap,
        players,
        tables,
        settings,
        rounds,

        elapsedMilliseconds,
        hasStarted,
        hasFinished,
        isInProgress,
        isComplete,
        remainingCount,
        currentRound,
        nextRoundToGenerate,
        generationIsComplete,
        readyToGenerateNextRound,
        estimatedDurationMinutes,
        durationMinutes,
        durationMilliseconds,
        clockDisplay,
        totalCost,
        freeTables,
        maxTableCount,
        nextFixture,
        nextFreeFixture,

        canStartFixture,
        canPrioritiseFixture,
        isBusy,
        getPlayerName,
        getTable,
        getRound,
        getRoundWithIndex,
        getFixtureStatus,
        getFixtureHeader,
        pauseClock,
        resumeClock,
        acknowledgeSwap,
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
    InProgress,
    Finished,
}
