export interface Result {
    id: string
    scores: Score[]
}

export interface Score {
    playerId: string
    score: number
}
