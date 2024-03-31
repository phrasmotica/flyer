import type { FlyerSettings } from "./FlyerSettings"
import type { Phase } from "./Phase"
import type { Player } from "./Player"
import type { Round } from "./Round"

export interface IScheduler {
    frameTimeEstimateMins: number
    estimateDuration(settings: FlyerSettings): number
    estimateDurationForPhase(phase: Phase): number
    estimateFixtureDuration(raceTo: number): number
    computeRoundNames(settings: FlyerSettings): string[]
    generateFixtures(settings: FlyerSettings, players: Player[]): Round[]
    generateFixturesForPhase(phase: Phase, players: Player[]): Round[]
}
