export interface Fixture {
    id: string
    parentFixtures: ParentFixture[]
    scores: Score[]
    tableId: string
    breakerId: string
    startTime: number | null
    finishTime: number | null
    cancelledTime: number | null
    comment: string
}

export interface FixtureSwap {
    id: string
    fixtureAId: string
    fixtureBId: string
    timestamp: number
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

export enum Prioritisation {
    None,
    Up,
    Down,
}
