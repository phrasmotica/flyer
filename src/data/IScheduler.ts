import type { Player } from "./Player"
import type { Round } from "./Round"

export interface IScheduler {
    frameTimeEstimateMins: number
    estimateDuration(players: number, raceTo: number, tables: number): number
    generateFixtures(players: Player[]): Round[]
    getCurrentRound(): number
}
