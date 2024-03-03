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
    tieBreaker: TieBreaker
    entryFeeRequired: boolean
    entryFee: number
    moneySplit: MoneySplit
    tableCostPerHour: number
    name: string
}

// TODO: store enum members as numeric values, and compute the names elsewhere
export enum Format {
    Knockout = "Knockout",
    RoundRobin = "Round Robin",
}

export enum RuleSet {
    International = "International",
    Blackball = "Blackball",
}

export enum TieBreaker {
    HeadToHead = "Head-to-Head",
    Runouts = "Runouts",
}

export enum MoneySplit {
    WinnerTakesAll = "Winner Takes All",
    SeventyThirty = "70/30",
    SixtyTwentyFiveFifteen = "60/25/15",
}
