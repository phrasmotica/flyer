import type { Flyer } from "./Flyer"
import type { PlayOff } from "./PlayOff"

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

export enum Format {
    Knockout,
    RoundRobin,
    WinnerStaysOn,
}

export enum RuleSet {
    Blackball,
    International,
}

export enum TieBreaker {
    HeadToHead,
    Runouts,
    PlayOff,
}

export enum MoneySplit {
    WinnerTakesAll,
    SeventyThirty,
    SixtyTwentyFiveFifteen,
    SemiFinalists,
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
