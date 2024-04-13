import { usePhase } from "./usePhase"

import type { Fixture, FixtureSwap } from "@/data/Fixture"
import type { Phase } from "@/data/Phase"

export const usePhaseEvents = (p: Phase | null) => {
    const {
        settings,
        players,
        fixtures,
        tables,
        getFixtureDescription, // MEDIUM: move this method into this composable
        getScoreDescription,
    } = usePhase(p)

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
        const f = fixtures.value.find(f => f.id === swap.fixtureAId)
        const g = fixtures.value.find(f => f.id === swap.fixtureBId)

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
