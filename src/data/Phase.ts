import type { PhaseSettings } from "./PhaseSettings"
import type { Player } from "./Player"
import type { Round } from "./Round"
import type { Table } from "./Table"

export interface Phase {
    id: string
    order: number
    players: Player[]
    tables: Table[]

    // HIGH: use a more minimal PhaseSettings type instead of FlyerSettings,
    // which should instead focus on the data in the flyer form
    settings: PhaseSettings

    startTime: number | null
    finishTime: number | null
    rounds: Round[]
}
