import type { Phase } from "./Phase"
import type { PlayerRecord } from "./PlayerRecord"

export interface Flyer {
    id: string
    startTime: number | null
    finishTime: number | null
    phases: Phase[]
    ranking: PlayerRecord[]
}
