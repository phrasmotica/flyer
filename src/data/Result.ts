export interface Result {
    id: string
    parentFixtureIds: string[]
    scores: Score[]
    startTime: number | null
    finishTime: number | null
    comment: string
}

export interface Score {
    playerId: string
    score: number
    runouts: number
    isBye: boolean
}
