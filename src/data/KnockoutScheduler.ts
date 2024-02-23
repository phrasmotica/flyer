import type { IScheduler } from "./IScheduler"
import type { Player } from "./Player"
import { Round } from "./Round"

export class KnockoutScheduler implements IScheduler {
    frameTimeEstimateMins: number = 7

    private generatedRounds?: Round[]

    constructor(private players: Player[]) {

    }

    estimateDuration(players: number, raceTo: number, tables: number) {
        // assumes perfect parallelisation across tables, i.e. does not account
        // for a player making their next opponent wait for their slow match
        const numFixtures = players * (players - 1) / 2
        const maxFrames = 2 * raceTo - 1
        const meanFrames = (raceTo + maxFrames) / 2
        const expectedFramesTotal = numFixtures * meanFrames
        return Math.ceil(this.frameTimeEstimateMins * expectedFramesTotal / tables)
    }

    generateFixtures() {
        if (this.generatedRounds !== undefined) {
            throw "Fixtures have already been generated!"
        }

        const overallPool = this.shuffle([...this.players])

        const numRounds = Math.ceil(Math.log2(this.players.length))

        let numSpaces = Math.pow(2, numRounds)
        let numFixtures = numSpaces / 2

        this.generatedRounds = <Round[]>[]

        // generate rounds of fixtures. For the first round:
        // 1. create an overall pool of all players
        // 2. create N fixtures, where N is enough to house all players, plus any byes
        // 3.
        let r = 0
        while (r < numRounds) {
            const round = new Round(r + 1, this.getRoundName(numSpaces))

            console.log(round.name)

            for (let i = 0; i < numFixtures; i++) {
                if (r === 0) {
                    const playerA = overallPool.pop()

                    round.addPlaceholderFixture([playerA!], 2, [])
                }
                else {
                    const previousRound = this.generatedRounds[r - 1]
                    const parentFixtureIds = previousRound.fixtures.slice(i * 2, (i + 1) * 2).map(f => f.id)

                    round.addPlaceholderFixture([], 2, parentFixtureIds)
                }
            }

            while (overallPool.length > 0) {
                round.fillFixture(overallPool.pop()!)
            }

            if (r === 0) {
                round.fillByes()
            }

            this.generatedRounds.push(round)

            numSpaces /= 2
            numFixtures /= 2
            r++
        }

        return this.generatedRounds
    }

    getRoundName(numSpaces: number) {
        switch (numSpaces) {
            case 2:
                return "Final"

            case 4:
                return "Semi-Finals"

            case 8:
                return "Quarter-Finals"

            default:
                return "Round of " + numSpaces
        }
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
