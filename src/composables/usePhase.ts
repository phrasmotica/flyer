import { computed, ref, watch } from "vue"

import { useClock } from "./useClock"
import { useFixtureList } from "./useFixtureList"
import { usePhaseSettings } from "./usePhaseSettings"
import { usePhaseTiming } from "./usePhaseTiming"
import { usePlayers } from "./usePlayers"
import { RoundStatus } from "./useRound"
import { useRounds } from "./useRounds"
import { useTables } from "./useTables"

import type { Fixture } from "@/data/Fixture"
import type { Phase } from "@/data/Phase"

// LOW: ideally this would not have to accept null, but we use it in places
// where the argument can currently be null (see ResultsTable.vue)
export const usePhase = (p: Phase | null) => {
    const phase = ref(p)

    const {
        fixtures,
        getFixtureOnTable,
    } = useFixtureList(phase.value)

    const {
        players,
        getPlayerName,
    } = usePlayers(phase.value)

    const {
        rounds,
        currentRound,
        generatedRounds,
        getRound,
    } = useRounds(phase.value)

    const {
        tables,
        costPerHour,
    } = useTables(phase.value)

    const {
        settings,
        isWinnerStaysOn,
    } = usePhaseSettings(phase.value)

    const {
        durationMilliseconds,
    } = usePhaseTiming(phase.value)

    const eventLog = computed(() => phase.value?.eventLog || [])

    const {
        clockable,
        elapsedMilliseconds,
        pauseClock,
        resumeClock,
    } = useClock("PhaseClock " + settings.value.name, phase.value)

    const readyToGenerateNextRound = computed(() => {
        if (!settings.value.randomlyDrawAllRounds) {
            return false
        }

        if (generatedRounds.value.length >= rounds.value.length) {
            return false
        }

        const lastGeneratedRound = generatedRounds.value.at(-1)
        return lastGeneratedRound && lastGeneratedRound.fixtures.every(f => f.startTime && f.finishTime)
    })

    const clockDisplay = computed(() => durationMilliseconds.value || elapsedMilliseconds.value)

    const totalCost = computed(() => {
        const durationHours = (durationMilliseconds.value || elapsedMilliseconds.value) / 3600000
        return costPerHour.value * durationHours
    })

    const freeTables = computed(() => tables.value.filter(t => !getFixtureOnTable(t.id)))

    const maxTableCount = computed(() => {
        if (isWinnerStaysOn.value) {
            return 1
        }

        return Math.floor(players.value.length / 2)
    })

    const nextFreeFixture = computed(() => fixtures.value.find(canPrioritiseFixture))

    const canStartFixture = (fixture: Fixture | undefined, currentRoundStatus: RoundStatus) => {
        return getFixtureStatus(fixture, currentRoundStatus) === FixtureStatus.ReadyToStart
    }

    const canPrioritiseFixture = (fixture: Fixture | undefined) => {
        const status = getFixtureStatus(fixture)

        const validStatuses = [
            FixtureStatus.ReadyToStart,
            FixtureStatus.WaitingForAssignment,
        ]

        if (!settings.value.requireCompletedRounds) {
            validStatuses.push(FixtureStatus.WaitingForRound)
        }

        return validStatuses.includes(status)
    }

    const isBusy = (playerId: string, forFixtureId: string) => {
        return rounds.value.flatMap(r => r.fixtures).some(f => {
            const isAssigned = (!!f.tableId && !f.finishTime) && f.id !== forFixtureId
            return isAssigned && f.scores.some(s => s.playerId === playerId)
        })
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

        if (fixture.scores.some(s => isBusy(s.playerId, fixture.id))) {
            return FixtureStatus.WaitingForPlayers
        }

        if (currentRoundStatus) {
            const round = getRound(fixture.id)
            const currentRoundNotFinished = currentRoundStatus !== RoundStatus.Finished
            if (settings.value.requireCompletedRounds && currentRoundNotFinished && (round?.index || -1) > currentRound.value.index) {
                return FixtureStatus.WaitingForRound
            }
        }

        if (!fixture.tableId) {
            if (freeTables.value.length <= 0) {
                return FixtureStatus.WaitingForTable
            }

            return FixtureStatus.WaitingForAssignment
        }

        if (!fixture.breakerId) {
            return FixtureStatus.WaitingForBreaker
        }

        return FixtureStatus.ReadyToStart
    }

    const getScoreDescription = (fixture: Fixture) => {
        if (fixture.scores.some(s => s.isBye)) {
            return "W/O"
        }

        return fixture.scores.map(s => s.score).join("-")
    }

    watch(phase, () => {
        clockable.value = phase.value
    })

    return {
        phase,

        eventLog,

        readyToGenerateNextRound,
        clockDisplay,
        totalCost,
        freeTables,
        maxTableCount,
        nextFreeFixture,

        canStartFixture,
        canPrioritiseFixture,
        isBusy,
        getFixtureStatus,
        getScoreDescription,
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
    WaitingForAssignment,
    WaitingForBreaker,
    ReadyToStart,
    InProgress,
    Finished,
}
