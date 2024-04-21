import type { Phase } from "./Phase"
import type { PlayOff } from "./PlayOff"

export interface PhaseSettings {
    matchLengthModel: MatchLengthModel
    bestOf: number
    raceTo: number
    winsRequired: number
    ruleSet: RuleSet
    format: Format
    stageCount: number
    randomlyDrawAllRounds: boolean
    requireCompletedRounds: boolean
    allowEarlyFinish: boolean
    tieBreaker: TieBreaker
    entryFeeRequired: boolean
    entryFee: number
    moneySplit: MoneySplit
    name: string
}

export enum MatchLengthModel {
    Fixed,
    Variable,
}

export enum Format {
    Knockout,
    RoundRobin,
    WinnerStaysOn,
    // LOW: implement "vs The Ghost" format for one player
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

export const createPlayOffSettings = (forPhase: Phase, tieBreaker: PlayOff, raceTo: number): PhaseSettings => ({
    allowEarlyFinish: false,
    bestOf: 1,
    entryFee: 0,
    entryFeeRequired: false,
    format: Format.Knockout,
    matchLengthModel: MatchLengthModel.Fixed,
    moneySplit: MoneySplit.WinnerTakesAll,
    name: tieBreaker.name,
    raceTo,
    randomlyDrawAllRounds: false,
    requireCompletedRounds: true,
    ruleSet: forPhase.settings.ruleSet,
    stageCount: 1,
    tieBreaker: forPhase.settings.tieBreaker,
    winsRequired: 0,
})
