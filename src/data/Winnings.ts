import type { Player } from "./Player"

export interface Winnings {
    player: Player
    amount: number | null
    colour: string
}
