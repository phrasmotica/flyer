import type { Player } from "./Player"
import type { PlayerRecord } from "./PlayerRecord"

export interface TieBreakerInfo {
    id: string
    name: string
    index: number
    forRank: number
    records: PlayerRecord[]
    players: Player[]
}
