import type { FlyerSettings } from "./FlyerSettings"
import type { IScheduler } from "./IScheduler"
import type { Phase } from "./Phase"
import type { Player } from "./Player"
import type { Round } from "./Round"

export class VsTheGhostScheduler implements IScheduler {
    frameTimeEstimateMins: number = 7

    estimateDuration(settings: FlyerSettings): number {
        // HIGH: implement
        return 0
    }

    estimateDurationForPhase(phase: Phase): number {
        // HIGH: implement
        return 0
    }

    estimateFixtureDuration(raceTo: number): number {
        // HIGH: implement
        return 0
    }

    computeRoundNames(settings: FlyerSettings): string[] {
        // HIGH: implement
        return []
    }

    generateFixtures(settings: FlyerSettings, players: Player[]): Round[] {
        // HIGH: implement
        return []
    }
}
