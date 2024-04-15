import type { PhaseSettings } from "./PhaseSettings"
import type { Table } from "./Table"

export type FlyerSettings = {
    playerCount: number
    playerNames: string[]
    bestOfPerRound: number[]
    tableCount: number
    tables: Table[]
    specification: PhaseSettings
}
