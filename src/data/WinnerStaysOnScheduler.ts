import { v4 as uuidv4 } from "uuid"

import type { ParentFixture, Fixture } from "./Fixture"
import type { FlyerSettings } from "./FlyerSettings"
import type { IScheduler } from "./IScheduler"
import type { Player } from "./Player"
import type { Round } from "./Round"

export class WinnerStaysOnScheduler implements IScheduler {
    frameTimeEstimateMins: number = 7

    private generatedRounds?: Round[]

    constructor(private winsRequired: number) {

    }

    estimateDuration(settings: FlyerSettings) {
        // always one frame per fixture, and one table
        const maxFrameCount = settings.playerCount * (this.winsRequired - 1) + 1
        const minFrameCount = this.winsRequired
        const expectedFramesTotal = (minFrameCount + maxFrameCount) / 2
        const expectedTime = this.frameTimeEstimateMins * expectedFramesTotal
        return Math.max(this.frameTimeEstimateMins, expectedTime)
    }

    generateFixtures(players: Player[]) {
        if (this.generatedRounds !== undefined) {
            throw "Fixtures have already been generated!"
        }

        this.generatedRounds = <Round[]>[]

        // Plan is this:
        // Randomise all players. Create P * (W - 1) + 1 fixtures, where W is
        // the number of wins required and P is the number of players. Populate
        // the first fixture with the first two players in the list, then put
        // the R remaining players in the "away" slot of the next R fixtures.
        // Propagate the winner of each fixture to the "home" slot of the next
        // fixture.

        const playerOrder = this.shuffle([...players])

        const maxFixtureCount = players.length * (this.winsRequired - 1) + 1
        let fixtureCount = 0

        let roundIndex = 1
        let lastFixtureId = ""

        while (fixtureCount < maxFixtureCount) {
            const newRound: Round = {
                fixtures: [],
                index: roundIndex,
                raceTo: null,
                isGenerated: true,
                name: "Round " + roundIndex,
            }

            for (let i = 0; i < players.length - 1 && fixtureCount < maxFixtureCount; i++) {
                const oneRoundAgoFixture = this.generatedRounds.at(-1)?.fixtures.at(i + 1 - players.length)

                // we might have enough fixtures midway through a round, so stop early
                const newFixture = this.addEmptyFixture(newRound, [
                    {
                        fixtureId: lastFixtureId,
                        takeLoser: false,
                    },
                    {
                        // ensure the away slots of fixtures in rounds after the first round
                        // will be filled by the most recent loser
                        fixtureId: oneRoundAgoFixture ? oneRoundAgoFixture.id : "",
                        takeLoser: true,
                    },
                ])

                lastFixtureId = newFixture.id
                fixtureCount++
            }

            this.generatedRounds.push(newRound)

            roundIndex++
        }

        // add the first two players into the first fixture
        this.addToFixture(this.generatedRounds[0], playerOrder.pop()!, 0)
        this.addToFixture(this.generatedRounds[0], playerOrder.pop()!, 1)

        // add the rest of the players to the away slots of the next fixtures
        while (playerOrder.length > 0) {
            this.addToFixture(this.generatedRounds[0], playerOrder.pop()!, 1)
        }

        return this.generatedRounds
    }

    private addEmptyFixture(round: Round, parentFixtures: ParentFixture[]) {
        const newFixture: Fixture = {
            id: uuidv4(),
            parentFixtures,
            scores: new Array<number>(2).fill(0).map(_ => ({
                playerId: "",
                score: 0,
                runouts: 0,
                isBye: false,
            })),
            breakerId: "",
            tableId: "",
            startTime: null,
            finishTime: null,
            cancelledTime: null,
            comment: "",
        }

        round.fixtures.push(newFixture)

        return newFixture
    }

    private addToFixture(round: Round, player: Player, slot: 0 | 1) {
        const fixture = round.fixtures.find(f => !f.scores[slot].playerId)
        if (fixture) {
            fixture.scores[slot].playerId = player.id
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
