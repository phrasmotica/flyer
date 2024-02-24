import type { Round } from "./Round"

export interface IScheduler {
    frameTimeEstimateMins: number
    estimateDuration(players: number, raceTo: number, tables: number): number
    generateFixtures(): Round[]
    getCurrentRound(): number
}
