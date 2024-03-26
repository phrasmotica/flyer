import type { Phase } from "./Phase"
import type { PlayOff } from "./PlayOff"
import type { Table } from "./Table"

export interface FlyerSettings {
    playerCount: number
    playerNames: string[]
    matchLengthModel: MatchLengthModel
    raceTo: number
    raceToPerRound: number[]
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

export enum MatchLengthModel {
    Fixed,
    Variable,
}

export enum Format {
    Knockout,
    RoundRobin,
    WinnerStaysOn,
    // HIGH: implement "vs The Ghost" format for one player
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

export const createPlayOffSettings = (phase: Phase, playOff: PlayOff): FlyerSettings => ({
    allowDraws: false,
    allowEarlyFinish: false,
    entryFee: 0,
    entryFeeRequired: false,
    format: Format.Knockout,
    matchLengthModel: MatchLengthModel.Fixed,
    moneySplit: MoneySplit.WinnerTakesAll,
    name: playOff.name,
    playerCount: playOff.players.length,
    playerNames: [],
    playOffId: playOff.id,
    raceTo: 1,
    raceToPerRound: [],
    randomlyDrawAllRounds: false,
    requireCompletedRounds: true,
    ruleSet: phase.settings.ruleSet,
    stageCount: 1,
    tables: phase.settings.tables,
    tableCount: phase.settings.tableCount,
    tieBreaker: phase.settings.tieBreaker,
    winsRequired: 0,
})
