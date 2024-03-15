import type { Flyer } from "./Flyer"
import type { PlayOff } from "./PlayOff"
import type { Table } from "./Table"

export interface FlyerSettings {
    playerCount: number
    playerNames: string[]
    raceTo: number
    winsRequired: number
    ruleSet: RuleSet
    tableCount: number
    tables: Table[]
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
    tables: flyer.settings.tables,
    tableCount: flyer.settings.tableCount,
    tieBreaker: flyer.settings.tieBreaker,
    winsRequired: 0,
}
