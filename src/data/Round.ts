import type { Fixture } from "./Fixture"

export interface Round {
    index: number
    name: string
    isGenerated: boolean
    fixtures: Fixture[]
}
