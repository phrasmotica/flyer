export interface Result {
    id: string
    parentFixtureIds: string[]
    scores: Score[]
    startTime: number | null
    finishTime: number | null
}

export interface Score {
    playerId: string
    score: number
    isBye: boolean
}
