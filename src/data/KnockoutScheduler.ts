import { v4 as uuidv4 } from "uuid"

import type { Fixture } from "./Fixture"
import type { FlyerSettings } from "./FlyerSettings"
import type { IScheduler } from "./IScheduler"
import type { Player } from "./Player"
import type { Round } from "./Round"

export class KnockoutScheduler implements IScheduler {
    frameTimeEstimateMins: number = 7

    private generatedRounds?: Round[]

    constructor(private randomDraw: boolean) {

    }

    estimateDuration(settings: FlyerSettings) {
        const numFixtures = settings.playerCount - 1

        // here a "group" is a set of fixtures that can be played in parallel
        let numFixturesPerGroup = [numFixtures]

        const maxFrames = 2 * settings.raceTo - 1
        const meanFrames = (settings.raceTo + maxFrames) / 2

        if (settings.randomlyDrawAllRounds && numFixtures > 1) {
            numFixturesPerGroup = this.computeFixturesPerRound(settings.playerCount)
        }

        // assumes perfect parallelisation across tables, i.e. does not account
        // for a player making their next opponent wait for their slow match

        // round number of fixtures UP to the next multiple of the number of
        // tables being used, to account for the fact that a fixture can only be
        // played on one table
        const meanFramesPerGroup = numFixturesPerGroup.map(n => meanFrames * Math.ceil(n / settings.tableCount) * settings.tableCount)
        const expectedTimePerGroup = meanFramesPerGroup.map(m => this.frameTimeEstimateMins * m)

        const expectedTime = Math.ceil(expectedTimePerGroup.reduce((x, y) => x + y) / settings.tableCount)
        return Math.max(this.frameTimeEstimateMins, expectedTime)
    }

    computeFixturesPerRound(playerCount: number) {
        const numFixtures = playerCount - 1

        if (numFixtures === 1 || !this.randomDraw) {
            return [numFixtures]
        }

        const finalRoundFixtures = 1
        const numFixturesPerGroup = [finalRoundFixtures]

        let remainingFixtures = numFixtures - 1
        let previousRoundFixtures = 2

        // need to split fixtures into several "groups": one for each round.
        // We do it in reverse: starting at 1, keep adding increasing powers
        // of 2 to the list, until the next power of 2 would exceed the total
        // number of fixtures. Then just add the remaining number of fixtures
        while (remainingFixtures > 0) {
            numFixturesPerGroup.unshift(Math.min(previousRoundFixtures, remainingFixtures))
            remainingFixtures -= previousRoundFixtures
            previousRoundFixtures *= 2
        }

        return numFixturesPerGroup
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
            // ensure the final round (match) always draws from the two semi-finals
            const takeFromParents = !this.randomDraw || r === numRounds - 1

            const round = this.generateRound(r, overallPool, numSpaces, takeFromParents)
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

    generateRound(r: number, overallPool: Player[], numSpaces: number, takeFromParents: boolean) {
        const round = <Round>{
            index: r + 1,
            name: this.getRoundName(numSpaces),
            isGenerated: r === 0 || takeFromParents,
            fixtures: [],
        }

        console.debug(round.name)

        const numFixtures = numSpaces / 2

        for (let i = 0; i < numFixtures; i++) {
            if (r === 0) {
                const playerA = overallPool.pop()

                this.addPlaceholderFixture(round, [playerA!], 2, [])
            }
            else {
                // random draw => choose the players later
                let parentFixtureIds = <string[]>[]

                if (takeFromParents) {
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
        const fixture = <Fixture>{
            id: uuidv4(),
            parentFixtures: parentFixtureIds.map(id => ({
                fixtureId: id,
                takeLoser: false,
            })),
            scores: players.map(p => ({
                playerId: p.id,
                score: 0,
                runouts: 0,
                isBye: false,
            })),
            tableId: "",
            breakerId: "",
            startTime: null,
            finishTime: null,
            comment: "",
        }

        for (let i = fixture.scores.length; i < playerCount; i++) {
            fixture.scores.push({
                playerId: "",
                score: 0,
                runouts: 0,
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
