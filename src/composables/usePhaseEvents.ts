import { useFixtureList } from "./useFixtureList"
import { usePhase } from "./usePhase"
import { usePhaseSettings } from "./usePhaseSettings"
import { usePlayers } from "./usePlayers"
import { useTables } from "./useTables"

import type { Fixture } from "@/data/Fixture"
import type { FixtureSwap } from "@/data/FixtureSwap"
import type { Phase } from "@/data/Phase"

export const usePhaseEvents = (p: Phase | null) => {
    const {
        phase,
    } = usePhase(p)

    const {
        getFixture,
    } = useFixtureList(phase.value)

    const {
        players,
        getPlayerName,
    } = usePlayers(phase.value)

    const {
        settings,
    } = usePhaseSettings(phase.value)

    const {
        tables,
    } = useTables(phase.value)

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

    const getScoreDescription = (fixture: Fixture) => {
        if (fixture.scores.some(s => s.isBye)) {
            return "W/O"
        }

        return fixture.scores.map(s => s.score).join("-")
    }

    const fixtureAssignedTable = (f: Fixture, tableId: string) => {
        const description = getFixtureDescription(f)
        const table = tables.value.find(t => t.id === tableId)
        if (!table) {
            return `${description} was assigned to an unknown table.`
        }

        return `${description} was assigned to ${table.name}.`
    }

    const fixtureAssignedBreaker = (f: Fixture, breakerId: string) => {
        const description = getFixtureDescription(f)
        const player = players.value.find(p => p.id === breakerId)
        if (!player) {
            return `An unknown player will break first in ${description}.`
        }

        return `${player.name} will break first in ${description}.`
    }

    const fixtureStarted = (f: Fixture) => `${getFixtureDescription(f)} was started.`
    const fixtureFinished = (f: Fixture) => `${getFixtureDescription(f)} finished ${getScoreDescription(f)}.`
    const fixtureAutoCompleted = (f: Fixture) => `${getFixtureDescription(f)} was auto-completed.`

    const phaseAutoCompleted = () => `${settings.value.name} was auto-completed.`

    const fixturesSwapped = (swap: FixtureSwap) => {
        const f = getFixture(swap.fixtureAId)
        const g = getFixture(swap.fixtureBId)

        const fixtureADescription = getFixtureDescription(f)
        const fixtureBDescription = getFixtureDescription(g)

        return `${fixtureBDescription} was prioritised in place of ${fixtureADescription}.`
    }

    return {
        fixtureAssignedTable,
        fixtureAssignedBreaker,
        fixtureStarted,
        fixtureFinished,
        fixtureAutoCompleted,

        phaseAutoCompleted,

        fixturesSwapped,
    }
}
