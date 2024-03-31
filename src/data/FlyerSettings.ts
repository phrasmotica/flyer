import type { PhaseSettings } from "./PhaseSettings"
import type { Table } from "./Table"

export type FlyerSettings = {
    playerCount: number
    playerNames: string[]
    raceToPerRound: number[]
    tableCount: number
    tables: Table[]
    playOffId: string
    specification: PhaseSettings
}
