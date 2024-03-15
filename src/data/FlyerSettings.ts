import type { Flyer } from "./Flyer"
import type { PlayOff } from "./PlayOff"

export interface FlyerSettings {
    playerCount: number
    playerNames: string[]
    raceTo: number
    winsRequired: number
    ruleSet: RuleSet
    tableCount: number
    tableNames: string[]
    tableCostsPerHour: number[]
    format: Format
    stageCount: number
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
    stageCount: 1,
    tableCostPerHour: flyer.settings.tableCostPerHour,
    tableCostsPerHour: flyer.settings.tableCostsPerHour,
    tableCount: flyer.settings.tableCount,
    tableNames: [],
    tieBreaker: flyer.settings.tieBreaker,
    winsRequired: 0,
}
