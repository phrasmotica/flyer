import type { FlyerSettings } from "./FlyerSettings"
import type { IScheduler } from "./IScheduler"
import type { Player } from "./Player"
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

        // HIGH: implement scheduling
        // Randomise all players. Create P * (W - 1) + 1 fixtures, where W is
        // the number of wins required and P is the number of players. Populate
        // the first fixture with the first two players in the list, then put
        // the R remaining players in the "away" slot of the next R fixtures.
        // Propagate the winner of each fixture to the "home" slot of the next
        // fixture.

        return this.generatedRounds
    }
}
