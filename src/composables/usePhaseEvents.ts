import { usePhase } from "./usePhase"

import type { Fixture } from "../data/Fixture"
import type { Phase } from "../data/Phase"

export const usePhaseEvents = (p: Phase | null) => {
    const {
        getFixtureDescription,
        getScoreDescription,
    } = usePhase(p)

    const fixtureStarted = (f: Fixture) => `${getFixtureDescription(f)} was started.`
    const fixtureFinished = (f: Fixture) => `${getFixtureDescription(f)} finished ${getScoreDescription(f)}.`
    const fixtureAutoCompleted = (f: Fixture) => `${getFixtureDescription(f)} was auto-completed.`

    const fixturesSwapped = (f: Fixture, g: Fixture) => {
        const fixtureADescription = getFixtureDescription(f)
        const fixtureBDescription = getFixtureDescription(g)
        return `${fixtureBDescription} was prioritised in place of ${fixtureADescription}.`
    }

    return {
        fixtureStarted,
        fixtureFinished,
        fixtureAutoCompleted,

        fixturesSwapped,
    }
}
