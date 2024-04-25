import type { Specification } from "./Specification"
import type { Table } from "./Table"

export type FlyerSettings = {
    playerCount: number
    playerNames: string[]
    raceToPerRound: number[]
    tableCount: number
    tables: Table[]
    specification: Specification
}

// this is awful, but it seems to be the only way that works. Shallow cloning
// the settings object, with a shallow clone of the specification and tables
// inside it, still causes issues with preset values being edited by the flyer
// form after they've been loaded. Horrible, but it works...
export const copy = (settings: FlyerSettings): FlyerSettings => ({
    playerCount: settings.playerCount,
    playerNames: settings.playerNames,
    raceToPerRound: settings.raceToPerRound,
    specification: {
        allowEarlyFinish: settings.specification.allowEarlyFinish,
        bestOf: settings.specification.bestOf,
        entryFee: settings.specification.entryFee,
        entryFeeRequired: settings.specification.entryFeeRequired,
        format: settings.specification.format,
        matchLengthModel: settings.specification.matchLengthModel,
        moneySplit: settings.specification.moneySplit,
        name: settings.specification.name,
        raceTo: settings.specification.raceTo,
        randomlyDrawAllRounds: settings.specification.randomlyDrawAllRounds,
        requireCompletedRounds: settings.specification.requireCompletedRounds,
        ruleSet: settings.specification.ruleSet,
        stageCount: settings.specification.stageCount,
        tieBreaker: settings.specification.tieBreaker,
        winsRequired: settings.specification.winsRequired,
    },
    tableCount: settings.tableCount,
    tables: settings.tables.map<Table>(t => ({
        id: t.id,
        costPerHour: t.costPerHour,
        name: t.name,
    })),
})
