import { v4 as uuidv4 } from "uuid"

import type { Player } from "../models/Player"
import type { Result } from "../models/Result"

export class Scheduler {
    constructor(private players: Player[]) {

    }

    generateRoundRobinFixtures() {
        const oddPlayerCount = this.players.length % 2 !== 0
        const numRounds = oddPlayerCount ? this.players.length : this.players.length - 1

        const rounds = <Round[]>[]

        // use this to omit a random player each round, if we have an odd number of players
        const omissionIndexes = this.shuffle(this.players.map((_, i) => i))

        // generate rounds of fixtures. For each round:
        // 1. create an overall pool of all players. If the number of players is odd, omit one player who has NOT yet been omitted from a round from this round
        // 2. select a random player ID from the overall pool as player A. E.g. 1 from [1, 2, 3, 4]
        // 3. extract, from ALL the existing fixtures, the IDs of players against whom they already have a fixture. E.g. [2]
        // 4. select a random player ID from the pool, EXCLUDING that extracted set of IDs and player A's ID, as player B. E.g. 4 from [3, 4]
        // 5. add a fixture for player A vs player B to this round. E.g. 1v4
        // 6. remove those IDs from the overall pool. E.g. [2, 3]
        // 7. repeat steps 1-5 until the overall pool has fewer than 2 players
        // 8. add the round to the list of rounds
        let r = 0
        while (r < numRounds) {
            console.log("Round " + (r + 1))

            let retry = false

            let overallPool = [...this.players]

            if (oddPlayerCount) {
                // omit a random player that hasn't been omitted yet
                console.log("Omitting: " + overallPool[omissionIndexes[r]].name)
                overallPool.splice(omissionIndexes[r], 1)
            }

            const fixtures = <Result[]>[]

            while (overallPool.length > 1) {
                const playerA = this.getRandom(overallPool)

                const existingFixtures = rounds.flatMap(r => r.fixtures).filter(f => f.scores.some(s => s.playerId === playerA.id))
                const existingOpponents = [...new Set(existingFixtures.map(f => f.scores.map(s => s.playerId).filter(id => id !== playerA.id)).flatMap(s => s))]

                const possibleOpponents = overallPool.filter(p => !existingOpponents.includes(p.id) && playerA.id !== p.id)
                if (possibleOpponents.length <= 0) {
                    // just keep retrying for now... address this deterministically later!
                    console.log("Retrying round...")
                    retry = true
                    break
                }

                const playerB = this.getRandom(possibleOpponents)

                console.log(playerA.name + " v " + playerB.name)

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

            if (retry) {
                continue
            }

            rounds.push({
                name: `Round ${++r}`,
                fixtures: fixtures,
            })
        }

        return rounds
    }

    getRandom<T>(arr: T[]) {
        return arr[Math.floor(Math.random() * arr.length)]
    }

    shuffle<T>(arr: T[]) {
        // https://stackoverflow.com/a/2450976
        let currentIndex = arr.length
        let randomIndex = 0

        // While there remain elements to shuffle.
        while (currentIndex > 0) {
            // Pick a remaining element.
            randomIndex = Math.floor(Math.random() * currentIndex)
            currentIndex--

            // And swap it with the current element.
            const temp = arr[currentIndex]
            arr[currentIndex] = arr[randomIndex]
            arr[randomIndex] = temp
        }

        return arr
    }
}

export interface Round {
    name: string
    fixtures: Result[]
}
