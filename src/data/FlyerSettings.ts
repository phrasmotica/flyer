export interface FlyerSettings {
    playerCount: number
    playerNames: string[]
    raceTo: number
    ruleSet: RuleSet
    tableCount: number
    format: Format
    randomlyDrawAllRounds: boolean
    requireCompletedRounds: boolean
    allowDraws: boolean
    allowEarlyFinish: boolean
    entryFeeRequired: boolean
    entryFee: number
    moneySplit: MoneySplit
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

export enum MoneySplit {
    WinnerTakesAll = "Winner Takes All",
    SeventyThirty = "70/30",
}
