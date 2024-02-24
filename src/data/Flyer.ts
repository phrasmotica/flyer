import type { Round } from "./Round"

export interface Flyer {
    id: string
    startTime: number | null
    finishTime: number | null
    rounds: Round[]
}
