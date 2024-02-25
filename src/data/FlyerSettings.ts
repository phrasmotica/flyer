export interface FlyerSettings {
    playerCount: number
    playerNames: string[]
    raceTo: number
    tableCount: number
    format: Format
    requireCompletedRounds: boolean
    allowEarlyFinish: boolean
    name: string
}

export enum Format {
    Knockout = "Knockout",
    RoundRobin = "Round Robin",
}
