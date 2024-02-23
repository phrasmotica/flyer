import type { Result } from "./Result"
import type { Round } from "./Round"

export class Flyer {
    public startTime: number | null
    public finishTime: number | null

    constructor(public rounds: Round[]) {
        this.startTime = null
        this.finishTime = null
    }

    start() {
        this.startTime = Date.now()

        for (const r of this.rounds) {
            const walkovers = r.completeWalkovers()

            for (const [fixtureId, winnerId] of walkovers) {
                // doing this just once is sufficient because we're not creating any fixtures
                // with a bye in both slots
                this.propagate(fixtureId, winnerId)
            }
        }
    }

    startFixture(id: string) {
        for (const r of this.rounds) {
            r.startFixture(id)
        }
    }

    updateResult(newResult: Result, finish: boolean) {
        for (const r of this.rounds) {
            const [fixtureId, winnerId] = r.updateResult(newResult, finish)

            if (finish) {
                this.propagate(fixtureId, winnerId)
            }
        }
    }

    // Updates results that depend on the one with the specified ID
    // with given player ID, intended to be that of the winner. Use it for
    // progressing a player through to the next stage of a knockout bracket.
    propagate(fixtureId: string, winnerId: string) {
        // TODO: inefficient to search through all future fixtures. Optimise
        // this somehow (only search future fixtures?), or redesign the whole
        // thing...
        for (const f of this.rounds.flatMap(r => r.fixtures)) {
            const slotIndex = f.parentFixtureIds.indexOf(fixtureId)
            if (slotIndex >= 0) {
                f.scores[slotIndex].playerId = winnerId
            }
        }
    }

    finish() {
        this.finishTime = Date.now()
    }

    getWinner() {
        const finalRound = this.rounds[this.rounds.length - 1]
        if (finalRound) {
            const final = finalRound.fixtures[finalRound.fixtures.length - 1]
            const winningScore = final.scores.reduce((s, t) => s.score > t.score ? s : t)
            return winningScore.playerId
        }

        return ""
    }
}
