import type { FlyerSettings } from "./FlyerSettings"
import type { Player } from "./Player"
import type { Round } from "./Round"

export interface Flyer {
    id: string
    players: Player[]
    settings: FlyerSettings
    startTime: number | null
    finishTime: number | null
    rounds: Round[]
}
