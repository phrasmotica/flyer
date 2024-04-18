import type { FixtureSwap } from "./FixtureSwap"
import type { PhaseEvent } from "./PhaseEvent"
import type { PhaseSettings } from "./PhaseSettings"
import type { Player } from "./Player"
import type { PlayerRecord } from "./PlayerRecord"
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
    skippedTime: number | null
    rounds: Round[]
    fixtureSwaps: FixtureSwap[]
    eventLog: PhaseEvent[]
    ranking: PlayerRecord[]
}
