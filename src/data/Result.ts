export interface Result {
    id: string
    scores: Score[]
    startTime: number | null
    finishTime: number | null
}

export interface Score {
    playerId: string
    score: number
    isBye: boolean
}
