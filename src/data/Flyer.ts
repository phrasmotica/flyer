import type { Player } from "./Player"
import type { Round } from "./Round"

export interface Flyer {
    id: string
    players: Player[]
    startTime: number | null
    finishTime: number | null
    rounds: Round[]
}
