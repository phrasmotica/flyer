import type { FixtureSwap } from "./FixtureSwap"
import type { PhaseEvent } from "./PhaseEvent"
import type { Player } from "./Player"
import type { PlayerRecord } from "./PlayerRecord"
import type { Round } from "./Round"
import type { Specification } from "./Specification"
import type { Table } from "./Table"
import type { TieBreakerInfo } from "./TieBreakerInfo"

export interface Phase {
    id: string
    order: number
    players: Player[]
    tables: Table[]
    settings: Specification
    startTime: number | null
    finishTime: number | null
    skippedTime: number | null
    rounds: Round[]
    fixtureSwaps: FixtureSwap[]
    eventLog: PhaseEvent[]
    ranking: PlayerRecord[]
    tieBreakers: TieBreakerInfo[]
}
