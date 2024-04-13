import { usePhase } from "./usePhase"

import type { Fixture } from "@/data/Fixture"
import type { Phase } from "@/data/Phase"

export const usePhaseEvents = (p: Phase | null) => {
    const {
        settings,
        tables,
        getFixtureDescription, // MEDIUM: move this method into this composable
        getScoreDescription,
    } = usePhase(p)

    const fixtureAssigned = (f: Fixture, tableId: string) => {
        const description = getFixtureDescription(f)
        const table = tables.value.find(t => t.id === tableId)
        if (!table) {
            return `${description} was assigned to an unknown table.`
        }

        return `${description} was assigned to ${table.name}.`
    }

    const fixtureStarted = (f: Fixture) => `${getFixtureDescription(f)} was started.`
    const fixtureFinished = (f: Fixture) => `${getFixtureDescription(f)} finished ${getScoreDescription(f)}.`
    const fixtureAutoCompleted = (f: Fixture) => `${getFixtureDescription(f)} was auto-completed.`

    const phaseAutoCompleted = () => `${settings.value.name} was auto-completed.`

    const fixturesSwapped = (f: Fixture, g: Fixture) => {
        const fixtureADescription = getFixtureDescription(f)
        const fixtureBDescription = getFixtureDescription(g)
        return `${fixtureBDescription} was prioritised in place of ${fixtureADescription}.`
    }

    return {
        fixtureAssigned,
        fixtureStarted,
        fixtureFinished,
        fixtureAutoCompleted,

        phaseAutoCompleted,

        fixturesSwapped,
    }
}
