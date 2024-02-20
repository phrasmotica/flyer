import { v4 as uuidv4 } from "uuid"

import type { Player } from "../models/Player"
import type { Result } from "../models/Result"

export class Scheduler {
    constructor(private players: Player[]) {

    }

    generateFixtures() {
        const fixtures = <Result[]>[]

        // generate fixtures lexicographically,
        // e.g. 1v2, 1v3, 1v4, 2v3, 2v4, 3v4
        this.players.forEach((p, i) => {
            for (let j = i + 1; j < this.players.length; j++) {
                fixtures.push({
                    id: uuidv4(),
                    scores: [p, this.players[j]].map(x => ({
                        playerId: x.id,
                        score: 0,
                    })),
                    startTime: null,
                })
            }
        })

        return fixtures
    }
}
