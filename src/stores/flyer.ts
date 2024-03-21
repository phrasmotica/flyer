import { useStorage } from "@vueuse/core"
import { defineStore } from "pinia"
import { v4 as uuidv4 } from "uuid"

import { useArray } from "../composables/useArray"
import { useFlyer } from "../composables/useFlyer"
import { usePhase } from "../composables/usePhase"

import type { Fixture, Score } from "../data/Fixture"
import type { Flyer } from "../data/Flyer"
import { createPlayOffSettings, type FlyerSettings } from "../data/FlyerSettings"
import type { IScheduler } from "../data/IScheduler"
import { KnockoutScheduler } from "../data/KnockoutScheduler"
import type { Phase } from "../data/Phase"
import type { Player } from "../data/Player"
import type { PlayOff } from "../data/PlayOff"
import type { Round } from "../data/Round"
import type { Table } from "../data/Table"

export const useFlyerStore = defineStore("flyer", () => {
    const flyer = useStorage<Flyer | null>("flyer", null, localStorage, {
        serializer: {
            read: v => JSON.parse(v) as Flyer,
            write: v => JSON.stringify(v),
        }
    })

    const {
        arr: playerPool,
        push: addToPlayerPool,
        clear: clearPlayerPool,
    } = useArray<string>()

    const {
        currentPhase, // HIGH: figure out why this is null until we reload the play page after beginning the flyer
    } = useFlyer(flyer.value)

    const {
        winsRequiredReached,
    } = usePhase(currentPhase.value)

    const setFlyer = (f: Flyer) => {
        flyer.value = f
    }

    const start = (settings: FlyerSettings, scheduler: IScheduler, players: Player[]) => {
        flyer.value = createFlyer(settings, scheduler, players)
    }

    const createFlyer = (settings: FlyerSettings, scheduler: IScheduler, players: Player[]) => {
        return <Flyer>{
            id: uuidv4(),
            phases: [createPhase(settings, scheduler, players)],
        }
    }

    const createPhase = (settings: FlyerSettings, scheduler: IScheduler, players: Player[]) => {
        if (players.length <= 0) {
            // use existing player entries if we can, else generate new ones
            const actualPlayerNames = settings.playerNames.slice(0, settings.playerCount)
            players = actualPlayerNames.map(n => ({
                id: uuidv4(),
                name: n,
            }))
        }

        const actualTables = settings.tables.slice(0, settings.tableCount)

        const phase = <Phase>{
            id: settings.playOffId || uuidv4(),
            order: 1,
            players,
            tables: actualTables.map(t => <Table>{ ...t, id: uuidv4() }),
            settings,
            startTime: Date.now(),
            finishTime: null,
            rounds: scheduler.generateFixtures(players),
        }

        for (const r of phase.rounds) {
            const walkovers = completeWalkovers(r, settings)

            for (const [fixtureId, winnerId] of walkovers) {
                // doing this just once is sufficient because we're not creating any fixtures
                // with a bye in both slots
                const didPropagate = tryPropagate(phase, fixtureId, winnerId, false)
                if (!didPropagate) {
                    // add winner to random draw pool for next round
                    addToPlayerPool(winnerId)
                }
            }
        }

        return phase
    }

    const completeWalkovers = (round: Round, settings: FlyerSettings) => {
        const ids: [string, string][] = []

        for (let f of round.fixtures) {
            const isWalkover = f.scores.some(s => s.isBye)
            if (isWalkover) {
                console.debug("Walking over " + f.id)

                const now = Date.now()
                f.startTime = now
                f.finishTime = now

                const winner = f.scores.find(s => !s.isBye && s.playerId)
                if (!winner) {
                    throw "No winner of walkover " + f.id + "!"
                }

                winner.score = settings.raceTo

                ids.push([f.id, winner.playerId])
            }
        }

        return ids
    }

    const startFixture = (id: string, tableId: string) => {
        for (const r of flyer.value!.phases.flatMap(p => p.rounds)) {
            const idx = r.fixtures.findIndex(f => f.id === id)
            if (idx >= 0) {
                r.fixtures[idx].startTime = Date.now()
                r.fixtures[idx].tableId = tableId
            }
        }
    }

    const updateComment = (fixtureId: string, comment: string) => {
        for (const r of flyer.value!.phases.flatMap(p => p.rounds)) {
            const idx = r.fixtures.findIndex(f => f.id === fixtureId)
            if (idx >= 0) {
                r.fixtures[idx].comment = comment
            }
        }
    }

    const updateScores = (fixtureId: string, scores: Score[], finishFixture: boolean) => {
        const phase = currentPhase.value
        if (!phase) {
            return
        }

        for (const r of phase.rounds) {
            const idx = r.fixtures.findIndex(f => f.id === fixtureId)
            if (idx >= 0) {
                r.fixtures[idx].scores = scores

                if (finishFixture) {
                    r.fixtures[idx].finishTime = Date.now()

                    if (winsRequiredReached.value) {
                        cancelRemaining()
                        finish()
                        return
                    }

                    const didPropagateWinner = tryPropagate(phase, fixtureId, getWinner(r.fixtures[idx]).playerId, false)
                    if (!didPropagateWinner) {
                        // add winner to random draw pool for next round
                        addToPlayerPool(getWinner(r.fixtures[idx]).playerId)
                    }

                    tryPropagate(phase, fixtureId, getLoser(r.fixtures[idx]).playerId, true)
                }
            }
        }
    }

    const generateNextRound = () => {
        if (!flyer.value) {
            return
        }

        // LOW: create player pool from scratch here, rather than maintaining
        // it in a ref

        const shuffledPlayerIds = shuffle(playerPool.value.slice())

        const nextRound = flyer.value.phases.flatMap(p => p.rounds).find(r => !r.isGenerated)!
        for (const f of nextRound.fixtures) {
            for (const s of f.scores) {
                s.playerId = shuffledPlayerIds.pop()!
            }
        }

        nextRound.isGenerated = true

        clearPlayerPool()
    }

    const shuffle = <T>(arr: T[]) => {
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

    const getWinner = (f: Fixture) => f.scores.reduce((s, t) => s.score > t.score ? s : t)

    const getLoser = (f: Fixture) => f.scores.reduce((s, t) => s.score < t.score ? s : t)

    const tryPropagate = (phase: Phase, fixtureId: string, playerId: string, takeLoser: boolean) => {
        for (const f of phase.rounds.flatMap(r => r.fixtures)) {
            const slotIndex = f.parentFixtures.findIndex(pf => pf.fixtureId === fixtureId && pf.takeLoser === takeLoser)
            if (slotIndex >= 0) {
                f.scores[slotIndex].playerId = playerId
                return true
            }
        }

        return false
    }

    const cancelRemaining = () => {
        if (!flyer.value) {
            return
        }

        const remainingFixtures = flyer.value.phases.flatMap(p => p.rounds)
            .flatMap(r => r.fixtures)
            .filter(f => !f.startTime && !f.finishTime && !f.cancelledTime)

        for (const f of remainingFixtures) {
            f.cancelledTime = Date.now()
        }
    }

    const finish = () => {
        if (currentPhase.value) {
            if (!currentPhase.value.finishTime) {
                const phase = flyer.value!.phases.find(p => p.id === currentPhase.value!.id)!
                phase.finishTime = Date.now()
            }

            return true
        }

        return false
    }

    const addPlayOff = (playOff: PlayOff, forPhase: Phase) => {
        const playOffPhase = createPhase(
            createPlayOffSettings(forPhase, playOff),
            new KnockoutScheduler(false),
            playOff.players
        )

        if (flyer.value) {
            flyer.value.phases = [...flyer.value.phases, playOffPhase]
        }
    }

    const clear = () => flyer.value = null

    return {
        flyer,
        setFlyer,

        start,
        startFixture,
        updateComment,
        updateScores,
        generateNextRound,
        finish,
        cancelRemaining,
        addPlayOff,
        clear,
    }
})
