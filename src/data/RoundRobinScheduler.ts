import { v4 as uuidv4 } from "uuid"

import type { FlyerSettings } from "./FlyerSettings"
import type { IScheduler } from "./IScheduler"
import type { Player } from "./Player"
import type { Round } from "./Round"

export class RoundRobinScheduler implements IScheduler {
    frameTimeEstimateMins: number = 7

    private generatedRounds?: Round[]

    estimateDuration(settings: FlyerSettings) {
        // assumes perfect parallelisation across tables, i.e. does not account
        // for a player making their next opponent wait for their slow match
        const numFixtures = settings.playerCount * (settings.playerCount - 1) / 2
        const maxFrames = 2 * settings.raceTo - 1
        const meanFrames = (settings.raceTo + maxFrames) / 2
        const expectedFramesTotal = numFixtures * meanFrames
        const expectedTime = Math.ceil(this.frameTimeEstimateMins * expectedFramesTotal / settings.tableCount)
        return Math.max(this.frameTimeEstimateMins, expectedTime)
    }

    generateFixtures(players: Player[]) {
        if (this.generatedRounds !== undefined) {
            throw "Fixtures have already been generated!"
        }

        let attempts = 0

        const oddPlayerCount = players.length % 2 !== 0
        const numRounds = oddPlayerCount ? players.length : players.length - 1

        this.generatedRounds = <Round[]>[]

        // use this to omit a random player each round, if we have an odd number of players
        const omissionIndexes = this.shuffle(players.map((_, i) => i))

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
        while (r < numRounds && attempts < 10) {
            const round = <Round>{
                index: r + 1,
                name: "Round " + (r + 1),
                isGenerated: true,
                fixtures: [],
            }

            console.log(round.name)

            let retry = false

            let overallPool = [...players]

            if (oddPlayerCount) {
                // omit a random player that hasn't been omitted yet
                console.log("Omitting: " + overallPool[omissionIndexes[r]].name)
                overallPool.splice(omissionIndexes[r], 1)
            }

            while (overallPool.length > 1) {
                const playerA = this.getRandom(overallPool)

                const existingOpponents = this.generatedRounds.flatMap(r => this.getExistingOpponents(r, playerA))

                const possibleOpponents = overallPool.filter(p => !existingOpponents.includes(p.id) && playerA.id !== p.id)
                if (possibleOpponents.length <= 0) {
                    // just keep retrying for now... address this deterministically later!
                    console.log("Retrying round...")
                    retry = true
                    break
                }

                const playerB = this.getRandom(possibleOpponents)

                this.addFixture(round, [playerA, playerB], [])

                overallPool = overallPool.filter(p => ![playerA.id, playerB.id].includes(p.id))
            }

            if (retry) {
                attempts++
                continue
            }

            this.generatedRounds.push(round)
            r++
        }

        if (attempts >= 10) {
            console.log("Failed to generate rounds after 10 attempts!")
        }

        return this.generatedRounds
    }

    private addFixture(round: Round, players: Player[], parentFixtureIds: string[]) {
        console.log(players.map(p => p.name).join(" v "))

        round.fixtures.push({
            id: uuidv4(),
            parentFixtureIds,
            scores: players.map(p => ({
                playerId: p.id,
                score: 0,
                isBye: false,
            })),
            startTime: null,
            finishTime: null,
        })
    }

    private getExistingOpponents(r: Round, player: Player) {
        const existingFixtures = r.fixtures.filter(f => f.scores.some(s => s.playerId === player.id))
        return [...new Set(existingFixtures.map(f => f.scores.map(s => s.playerId).filter(id => id !== player.id)).flatMap(s => s))]
    }

    getCurrentRound() {
        if (this.generatedRounds === undefined) {
            return 0
        }

        const oldestInProgressRound = this.generatedRounds.find(r => r.fixtures.some(f => !f.finishTime))
        if (!oldestInProgressRound) {
            return 0
        }

        return oldestInProgressRound.index
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
