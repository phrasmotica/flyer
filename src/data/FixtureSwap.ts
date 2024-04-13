export interface FixtureSwap {
    id: string

    roundAIndex: number
    fixtureAIndex: number
    fixtureAId: string

    roundBIndex: number
    fixtureBIndex: number
    fixtureBId: string

    timestamp: number
}

export enum Prioritisation {
    None,
    Up,
    Down,
}
