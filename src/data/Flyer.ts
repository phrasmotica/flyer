import type { FlyerSettings } from "./FlyerSettings"
import type { Player } from "./Player"
import type { Round } from "./Round"
import type { Table } from "./Table"

export interface Flyer {
    id: string
    players: Player[]
    tables: Table[]
    settings: FlyerSettings
    startTime: number | null
    finishTime: number | null
    rounds: Round[]
    playOffs: Flyer[]
}
