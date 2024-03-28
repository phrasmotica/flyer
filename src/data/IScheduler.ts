import type { Player } from "./Player"
import type { Round } from "./Round"

export interface IScheduler {
    frameTimeEstimateMins: number
    estimateDuration(): number
    estimateFixtureDuration(raceTo: number): number
    generateFixtures(players: Player[]): Round[]
}
