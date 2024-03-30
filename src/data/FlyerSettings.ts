import type { PhaseSettings } from "./PhaseSettings"
import type { Table } from "./Table"

// HIGH: create a field of type PhaseSettings, instead of using an intersection type
export type FlyerSettings = PhaseSettings & {
    playerCount: number
    playerNames: string[]
    raceToPerRound: number[]
    tableCount: number
    tables: Table[]
    playOffId: string
}
