// HIGH: rename this, end everything related, to Match
export interface Result {
    id: string
    parentFixtures: ParentFixture[]
    scores: Score[]
    startTime: number | null
    finishTime: number | null
    cancelledTime: number | null
    comment: string
}

export interface ParentFixture {
    fixtureId: string
    takeLoser: boolean
}

export interface Score {
    playerId: string
    score: number
    runouts: number
    isBye: boolean
}
