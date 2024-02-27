import { v4 as uuidv4 } from "uuid"

import type { FlyerSettings } from "./FlyerSettings"
import type { IScheduler } from "./IScheduler"
import type { Player } from "./Player"
import type { Round } from "./Round"
import type { Result } from "./Result"

export class KnockoutScheduler implements IScheduler {
    frameTimeEstimateMins: number = 7

    private generatedRounds?: Round[]

    constructor(private randomDraw: boolean) {

    }

    estimateDuration(settings: FlyerSettings) {
        // TODO: allow for random draw, i.e. rounds needing to be completed

        // assumes perfect parallelisation across tables, i.e. does not account
        // for a player making their next opponent wait for their slow match
        const numFixtures = settings.playerCount - 1
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

        const numRounds = Math.ceil(Math.log2(players.length))

        const overallPool = this.shuffle([...players])

        let numSpaces = Math.pow(2, numRounds)

        this.generatedRounds = <Round[]>[]

        // generate rounds of fixtures. For the first round:
        // 1. create an overall pool of all players
        // 2. create N fixtures, where N is enough to house all players, plus any byes
        // 3.
        let r = 0
        while (r < numRounds) {
            const round = this.generateRound(r, overallPool, numSpaces, this.randomDraw)
            this.generatedRounds.push(round)

            numSpaces /= 2
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

    generateRound(r: number, overallPool: Player[], numSpaces: number, random: boolean) {
        const round = <Round>{
            index: r + 1,
            name: this.getRoundName(numSpaces),
            isGenerated: r === 0 || !this.randomDraw,
            fixtures: [],
        }

        console.log(round.name)

        const numFixtures = numSpaces / 2

        for (let i = 0; i < numFixtures; i++) {
            if (r === 0) {
                const playerA = overallPool.pop()

                this.addPlaceholderFixture(round, [playerA!], 2, [])
            }
            else {
                // random draw => choose the players later
                let parentFixtureIds = <string[]>[]

                if (!random) {
                    const previousRound = this.generatedRounds![r - 1]
                    parentFixtureIds = previousRound.fixtures.slice(i * 2, (i + 1) * 2).map(f => f.id)
                }

                this.addPlaceholderFixture(round, [], 2, parentFixtureIds)
            }
        }

        while (overallPool.length > 0) {
            this.fillFixture(round, overallPool.pop()!)
        }

        if (r === 0) {
            this.fillByes(round)
        }

        return round
    }

    private addPlaceholderFixture(round: Round, players: Player[], playerCount: number, parentFixtureIds: string[]) {
        const fixture = <Result>{
            id: uuidv4(),
            parentFixtureIds,
            scores: players.map(p => ({
                playerId: p.id,
                score: 0,
            })),
            startTime: null,
            finishTime: null,
        }

        for (let i = fixture.scores.length; i < playerCount; i++) {
            fixture.scores.push({
                playerId: "",
                score: 0,
                isBye: false,
            })
        }

        round.fixtures.push(fixture)
    }

    private fillFixture(round: Round, player: Player) {
        for (let f of round.fixtures) {
            const emptySpace = f.scores.find(s => !s.playerId)

            if (emptySpace) {
                emptySpace.playerId = player.id
                return
            }
        }
    }

    private fillByes(round: Round) {
        for (let f of round.fixtures) {
            const emptySpaces = f.scores.filter(s => !s.playerId)
            for (const s of emptySpaces) {
                s.isBye = true
            }
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
