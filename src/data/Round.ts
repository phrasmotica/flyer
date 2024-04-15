import type { Fixture } from "./Fixture"

export interface Round {
    index: number
    name: string
    bestOf: number | null
    isGenerated: boolean
    fixtures: Fixture[]
}
