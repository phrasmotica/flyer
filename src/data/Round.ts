import type { Result } from "./Result"

export interface Round {
    index: number
    name: string
    isGenerated: boolean
    fixtures: Result[]
}
