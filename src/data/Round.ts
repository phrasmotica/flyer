import { v4 as uuidv4 } from "uuid"

import type { Player } from "./Player"
import type { Result } from "./Result"

export class Round {
    public index: number
    public name: string
    public fixtures: Result[]

    constructor(index: number, name: string) {
        this.index = index
        this.name = name
        this.fixtures = []
    }

    addFixture(players: Player[]) {
        console.log(players.map(p => p.name).join(" v "))

        this.fixtures.push({
            id: uuidv4(),
            scores: players.map(p => ({
                playerId: p.id,
                score: 0,
                isBye: false,
            })),
            startTime: null,
            finishTime: null,
        })
    }

    addPlaceholderFixture(players: Player[], playerCount: number) {
        const fixture = <Result>{
            id: uuidv4(),
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

        this.fixtures.push(fixture)
    }

    fillFixture(player: Player) {
        for (let f of this.fixtures) {
            const emptySpace = f.scores.find(s => !s.playerId)

            if (emptySpace) {
                emptySpace.playerId = player.id
                return
            }
        }
    }

    fillByes() {
        for (let f of this.fixtures) {
            const emptySpaces = f.scores.filter(s => !s.playerId)
            for (const s of emptySpaces) {
                s.isBye = true
            }
        }
    }

    completeWalkovers() {
        for (let f of this.fixtures) {
            const isWalkover = f.scores.some(s => s.isBye)
            if (isWalkover) {
                console.log("Walking over " + f.id)

                const now = Date.now()
                f.startTime = now
                f.finishTime = now
            }
        }
    }

    startFixture(id: string) {
        const idx = this.fixtures.findIndex(f => f.id === id)
        if (idx >= 0) {
            this.fixtures[idx].startTime = Date.now()
        }
    }

    updateResult(newResult: Result, finish: boolean) {
        const idx = this.fixtures.findIndex(f => f.id === newResult.id)
        if (idx >= 0) {
            if (finish) {
                newResult.finishTime = Date.now()
            }

            this.fixtures[idx] = newResult
        }
    }

    getExistingFixtures(player: Player) {
        return this.fixtures.filter(f => f.scores.some(s => s.playerId === player.id))
    }

    getExistingOpponents(player: Player) {
        const existingFixtures = this.getExistingFixtures(player)
        return [...new Set(existingFixtures.map(f => f.scores.map(s => s.playerId).filter(id => id !== player.id)).flatMap(s => s))]
    }
}
