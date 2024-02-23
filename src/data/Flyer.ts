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
            r.completeWalkovers()
        }
    }

    startFixture(id: string) {
        for (const r of this.rounds) {
            r.startFixture(id)
        }
    }

    updateResult(newResult: Result, finish: boolean) {
        for (const r of this.rounds) {
            r.updateResult(newResult, finish)
        }
    }

    finish() {
        this.finishTime = Date.now()
    }
}
