import { v4 as uuidv4 } from "uuid"

import type { Fixture } from "./Fixture"
import { MatchLengthModel, type FlyerSettings } from "./FlyerSettings"
import type { IScheduler } from "./IScheduler"
import type { Player } from "./Player"
import type { Round } from "./Round"

export class RoundRobinScheduler implements IScheduler {
    generationAttempts: number = 50
    frameTimeEstimateMins: number = 7

    private generatedRounds?: Round[]

    constructor(private settings: FlyerSettings) {

    }

    estimateDuration() {
        // assumes perfect parallelisation across tables, i.e. does not account
        // for a player making their next opponent wait for their slow match
        const numFixtures = this.settings.stageCount * this.settings.playerCount * (this.settings.playerCount - 1) / 2
        const maxFrames = 2 * this.settings.raceTo - 1
        const meanFrames = (this.settings.raceTo + maxFrames) / 2
        const expectedFramesTotal = numFixtures * meanFrames
        const expectedTime = Math.ceil(this.frameTimeEstimateMins * expectedFramesTotal / this.settings.tableCount)
        return Math.max(this.frameTimeEstimateMins, expectedTime)
    }

    estimateFixtureDuration(raceTo: number) {
        const isVariableMatchLength = this.settings.matchLengthModel === MatchLengthModel.Variable
        const actualRaceTo = isVariableMatchLength ? raceTo : this.settings.raceTo
        const meanFrames = (actualRaceTo + (2 * actualRaceTo - 1)) / 2
        return this.frameTimeEstimateMins * 60 * meanFrames
    }

    // HIGH: only generate the first round of fixtures, then generate the next ones as those fixtures finish.
    // That way it'll ensure players are free for each fixture
    generateFixtures(players: Player[]) {
        if (this.generatedRounds !== undefined) {
            throw "Fixtures have already been generated!"
        }

        let attempts = 0

        const numRounds = players.length % 2 !== 0 ? players.length : players.length - 1

        this.generatedRounds = <Round[]>[]

        // use this to omit a random player each round, if we have an odd number of players
        const omissionIndexes = this.shuffle(players.map((_, i) => i))

        let r = 0
        while (r < numRounds && attempts < this.generationAttempts) {
            const [retry, round] = this.createRound(r + 1, players, omissionIndexes[r])

            if (retry) {
                attempts++
                continue
            }

            this.generatedRounds.push(round)
            r++
        }

        if (attempts >= this.generationAttempts) {
            throw `Failed to generate rounds after ${this.generationAttempts} attempt(s)!`
        }

        if (this.settings.stageCount > 1) {
            for (let a = 0; a < this.settings.stageCount - 1; a++) {
                // copy the last N rounds
                const roundsToCopy = this.generatedRounds.slice(-numRounds)

                // collect the existing fixtures up into one list, and
                // distribute them randomly into another set of rounds
                const newRounds = this.copyRounds(roundsToCopy)
                this.generatedRounds.push(...newRounds)
            }
        }

        return this.generatedRounds
    }

    private createRound(index: number, players: Player[], omissionIndex: number): [boolean, Round] {
        // 1. create an overall pool of all players. If the number of players is odd, omit one player who has NOT yet been omitted from a round from this round
        // 2. select a random player ID from the overall pool as player A. E.g. 1 from [1, 2, 3, 4]
        // 3. extract, from ALL the existing fixtures, the IDs of players against whom they already have a fixture. E.g. [2]
        // 4. select a random player ID from the pool, EXCLUDING that extracted set of IDs and player A's ID, as player B. E.g. 4 from [3, 4]
        // 5. add a fixture for player A vs player B to this round. E.g. 1v4
        // 6. remove those IDs from the overall pool. E.g. [2, 3]
        // 7. repeat steps 1-5 until the overall pool has fewer than 2 players
        const round: Round = {
            index,
            name: "Round " + index,
            raceTo: null,
            isGenerated: true,
            fixtures: [],
        }

        console.debug(round.name)

        let retry = false

        let overallPool = [...players]

        if (players.length % 2 !== 0) {
            // omit a random player that hasn't been omitted yet
            console.debug("Omitting: " + overallPool[omissionIndex].name)
            overallPool.splice(omissionIndex, 1)
        }

        while (overallPool.length > 1) {
            const playerA = this.getRandom(overallPool)

            const existingOpponents = this.generatedRounds!.flatMap(r => this.getExistingOpponents(r, playerA))

            const possibleOpponents = overallPool.filter(p => !existingOpponents.includes(p.id) && playerA.id !== p.id)
            if (possibleOpponents.length <= 0) {
                // just keep retrying for now... address this deterministically later!
                console.debug("Retrying round...")
                retry = true
                break
            }

            const playerB = this.getRandom(possibleOpponents)

            this.addFixture(round, [playerA, playerB])

            overallPool = overallPool.filter(p => ![playerA.id, playerB.id].includes(p.id))
        }

        return [retry, round]
    }

    private copyRounds(rounds: Round[]) {
        const existingFixtures = rounds.flatMap(r => r.fixtures)

        const newFixtures = this.shuffle(existingFixtures.map<Fixture>(f => ({
            ...f,
            id: uuidv4(),
            scores: f.scores.slice().reverse(),
        })))

        const startIndex = rounds.at(-1)!.index
        const fixturesPerRound = rounds[0].fixtures.length

        const newRounds = rounds.map<Round>((_, r) => ({
            index: startIndex + (r + 1),
            name: "Round " + (startIndex + r + 1),
            raceTo: null,
            isGenerated: true,
            fixtures: newFixtures.splice(0, fixturesPerRound),
        }))

        return newRounds
    }

    private addFixture(round: Round, players: Player[]) {
        console.debug(players.map(p => p.name).join(" v "))

        round.fixtures.push({
            id: uuidv4(),
            parentFixtures: [],
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
            cancelledTime: null,
            comment: "",
        })
    }

    private getExistingOpponents(r: Round, player: Player) {
        const existingFixtures = r.fixtures.filter(f => f.scores.some(s => s.playerId === player.id))
        const existingOpponentIds = existingFixtures.map(f => f.scores.map(s => s.playerId).filter(id => id !== player.id)).flatMap(s => s)
        return [...new Set(existingOpponentIds)]
    }

    getRandom<T>(arr: T[]) {
        return arr[Math.floor(Math.random() * arr.length)]
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
