import type { Phase } from "./Phase"
import type { PlayOff } from "./PlayOff"

export interface PhaseSettings {
    matchLengthModel: MatchLengthModel
    bestOf: number // HIGH: store "best-of" value so we can allow draws, e.g. best of 6 frames
    winsRequired: number
    ruleSet: RuleSet
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

export const createPlayOffSettings = (phase: Phase, playOff: PlayOff): PhaseSettings => ({
    allowDraws: false,
    allowEarlyFinish: false,
    bestOf: 1,
    entryFee: 0,
    entryFeeRequired: false,
    format: Format.Knockout,
    matchLengthModel: MatchLengthModel.Fixed,
    moneySplit: MoneySplit.WinnerTakesAll,
    name: playOff.name,
    randomlyDrawAllRounds: false,
    requireCompletedRounds: true,
    ruleSet: phase.settings.ruleSet,
    stageCount: 1,
    tieBreaker: phase.settings.tieBreaker,
    winsRequired: 0,
})
