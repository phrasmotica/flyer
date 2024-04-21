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
