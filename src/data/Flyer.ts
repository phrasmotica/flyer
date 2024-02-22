import type { Result } from "./Result"
import type { Round } from "./Round"

export class Flyer {
    constructor(private rounds: Round[]) {

    }

    getRounds() {
        return this.rounds
    }

    startFixture(id: string) {
        for (const r of this.rounds) {
            r.startFixture(id)
        }

        return this
    }

    updateResult(newResult: Result, finish: boolean) {
        for (const r of this.rounds) {
            r.updateResult(newResult, finish)
        }

        return this
    }
}
