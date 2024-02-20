import { v4 as uuidv4 } from "uuid"

import type { Player } from "../models/Player"
import type { Result } from "../models/Result"

export class Scheduler {
    constructor(private players: Player[]) {

    }

    generateFixtures() {
        const numRounds = this.players.length - 1
        const rounds = <Round[]>[]

        // generate rounds of fixtures. For each round:
        // 1. select a random player ID from the overall pool as player A. E.g. 1 from [1, 2, 3, 4]
        // 2. extract, from ALL the existing fixtures, the IDs of players against whom they already have a fixture. E.g. [2]
        // 3. select a random player ID from the pool, EXCLUDING that extracted set of IDs and player A's ID, as player B. E.g. 4 from [3, 4]
        // 4. add a fixture for player A vs player B to this round. E.g. 1v4
        // 5. remove those IDs from the overall pool. E.g. [2, 3]
        // 6. repeat steps 1-5 until the overall pool is empty
        for (let r = 0; r < numRounds; r++) {
            let overallPool = [...this.players]
            const fixtures = <Result[]>[]

            while (overallPool.length > 0) {
                const playerA = this.getRandom(overallPool)

                const existingFixtures = rounds.flatMap(r => r.fixtures).filter(f => f.scores.some(s => s.playerId === playerA.id))
                const existingOpponents = [...new Set(existingFixtures.map(f => f.scores.map(s => s.playerId).filter(id => id !== playerA.id)).flatMap(s => s))]

                const possibleOpponents = overallPool.filter(p => !existingOpponents.includes(p.id) && playerA.id !== p.id)
                const playerB = this.getRandom(possibleOpponents)

                fixtures.push({
                    id: uuidv4(),
                    scores: [
                        {
                            playerId: playerA.id,
                            score: 0,
                        },
                        {
                            playerId: playerB.id,
                            score: 0,
                        },
                    ],
                    startTime: null,
                })

                overallPool = overallPool.filter(p => ![playerA.id, playerB.id].includes(p.id))
            }

            rounds.push({
                name: `Round ${r + 1}`,
                fixtures: fixtures,
            })
        }

        return rounds
    }

    getRandom<T>(arr: T[]) {
        return arr[Math.floor(Math.random() * arr.length)]
    }
}

interface Round {
    name: string
    fixtures: Result[]
}
