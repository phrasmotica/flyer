import type { Player } from "./Player"
import type { PlayerRecord } from "./PlayerRecord"

export interface PlayOff {
    id: string
    name: string
    forRank: number
    records: PlayerRecord[]
    players: Player[]
}
