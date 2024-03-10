import { v4 as uuidv4 } from "uuid"

import type { FlyerSettings } from "./FlyerSettings"
import type { IScheduler } from "./IScheduler"
import type { Player } from "./Player"
import type { Result } from "./Result"
import type { Round } from "./Round"

export class WinnerStaysOnScheduler implements IScheduler {
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

        this.generatedRounds = <Round[]>[]

        // Plan is this:
        // Randomise all players. Create P * (W - 1) + 1 fixtures, where W is
        // the number of wins required and P is the number of players. Populate
        // the first fixture with the first two players in the list, then put
        // the R remaining players in the "away" slot of the next R fixtures.
        // Propagate the winner of each fixture to the "home" slot of the next
        // fixture.

        const playerOrder = this.shuffle([...players])

        const firstRound = <Round>{
            fixtures: [],
            index: 1,
            isGenerated: true,
            name: "Round 1",
        }

        const lastFixture = this.addFixture(firstRound, playerOrder.slice(0, 2), [])
        let lastFixtureId = lastFixture.id

        for (const p of playerOrder.slice(2)) {
            const newFixture = this.addFixture(firstRound, [{
                id: "",
                name: "TBC",
            }, p], [lastFixtureId, ""])

            lastFixtureId = newFixture.id
        }

        this.generatedRounds.push(firstRound)

        // HIGH: created more rounds of P - 1 fixtures, ensuring that a maximum
        // of P * (W - 1) + 1 fixtures are created

        return this.generatedRounds
    }

    private addFixture(round: Round, players: Player[], parentFixtureIds: string[]) {
        console.debug(players.map(p => p.name).join(" v "))

        const newFixture = <Result>{
            id: uuidv4(),
            parentFixtureIds,
            scores: players.map(p => ({
                playerId: p.id,
                score: 0,
                runouts: 0,
                isBye: false,
            })),
            startTime: null,
            finishTime: null,
            comment: "",
        }

        round.fixtures.push(newFixture)

        return newFixture
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
