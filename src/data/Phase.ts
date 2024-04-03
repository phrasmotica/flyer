import type { FixtureSwap } from "./Fixture"
import type { PhaseSettings } from "./PhaseSettings"
import type { Player } from "./Player"
import type { Round } from "./Round"
import type { Table } from "./Table"

export interface Phase {
    id: string
    order: number
    players: Player[]
    tables: Table[]
    settings: PhaseSettings
    startTime: number | null
    finishTime: number | null
    rounds: Round[]
    fixtureSwaps: FixtureSwap[]
    eventLog: PhaseEvent[]
}

export interface PhaseEvent {
    timestamp: number
    message: string
}
