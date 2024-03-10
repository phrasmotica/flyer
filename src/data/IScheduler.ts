import type { FlyerSettings } from "./FlyerSettings"
import type { Player } from "./Player"
import type { Round } from "./Round"

export interface IScheduler {
    frameTimeEstimateMins: number
    estimateDuration(settings: FlyerSettings): number
    generateFixtures(players: Player[]): Round[]
}
