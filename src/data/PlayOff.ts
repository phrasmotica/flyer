import type { Player } from "./Player"
import type { PlayerRecord } from "./PlayerRecord"

// HIGH: rename this, and everything related, to "TieBreaker". Only things
// that are actually play-offs should be named such
export interface PlayOff {
    id: string
    name: string
    index: number
    forRank: number
    records: PlayerRecord[]
    players: Player[]
}
