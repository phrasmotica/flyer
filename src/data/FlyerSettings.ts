export interface FlyerSettings {
    playerCount: number
    playerNames: string[]
    raceTo: number
    ruleSet: RuleSet
    tableCount: number
    format: Format
    requireCompletedRounds: boolean
    allowDraws: boolean
    allowEarlyFinish: boolean
    name: string
}

export enum Format {
    Knockout = "Knockout",
    RoundRobin = "Round Robin",
}

export enum RuleSet {
    International = "International",
    Blackball = "Blackball",
}
