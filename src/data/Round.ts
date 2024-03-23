import type { Fixture } from "./Fixture"

export interface Round {
    index: number
    name: string
    raceTo: number | null
    isGenerated: boolean
    fixtures: Fixture[]
}
