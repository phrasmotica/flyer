import type { Flyer } from "./Flyer"

import type { PlayOff } from "../composables/useStandings"

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
    playOffId: string
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
    PlayOff = "Play-Off",
}

export enum MoneySplit {
    WinnerTakesAll = "Winner Takes All",
    SeventyThirty = "70/30",
    SixtyTwentyFiveFifteen = "60/25/15",
}

export const createPlayOffSettings = (flyer: Flyer, playOff: PlayOff) => <FlyerSettings>{
    allowDraws: false,
    allowEarlyFinish: false,
    entryFee: 0,
    entryFeeRequired: false,
    format: Format.Knockout,
    moneySplit: MoneySplit.WinnerTakesAll,
    name: playOff.name,
    playerCount: playOff.players.length,
    playerNames: [],
    playOffId: playOff.id,
    raceTo: 1,
    randomlyDrawAllRounds: false,
    requireCompletedRounds: true,
    ruleSet: flyer.settings.ruleSet,
    tableCostPerHour: flyer.settings.tableCostPerHour,
    tableCount: flyer.settings.tableCount,
    tieBreaker: flyer.settings.tieBreaker,
}
