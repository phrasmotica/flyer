import { useStorage } from "@vueuse/core"
import { defineStore } from "pinia"
import { v4 as uuidv4 } from "uuid"

import { useRankings } from "../composables/useRankings"

import type { Score } from "../data/Fixture"
import type { Flyer } from "../data/Flyer"
import { createPlayOffSettings, Format, type FlyerSettings } from "../data/FlyerSettings"
import type { IScheduler } from "../data/IScheduler"
import { KnockoutScheduler } from "../data/KnockoutScheduler"
import type { Phase } from "../data/Phase"
import type { Player } from "../data/Player"
import type { PlayOff } from "../data/PlayOff"
import type { Round } from "../data/Round"
import { RoundRobinScheduler } from "../data/RoundRobinScheduler"
import type { Table } from "../data/Table"
import { WinnerStaysOnScheduler } from "../data/WinnerStaysOnScheduler"

export const useFlyerStore = defineStore("flyer", () => {
    const flyer = useStorage<Flyer | null>("flyer", null, localStorage, {
        serializer: {
            read: v => JSON.parse(v) as Flyer,
            write: v => JSON.stringify(v),
        }
    })

    const {
        computeStandings,
        getWinner,
        getLoser,
    } = useRankings()

    const setFlyer = (f: Flyer) => {
        flyer.value = f
    }

    const start = (settings: FlyerSettings) => {
        let scheduler: IScheduler | null = null

        switch (settings.format) {
            case Format.Knockout:
                scheduler = new KnockoutScheduler(settings)
                break

            case Format.RoundRobin:
                scheduler = new RoundRobinScheduler(settings)
                break

            case Format.WinnerStaysOn:
                scheduler = new WinnerStaysOnScheduler(settings)
                break

            default:
                throw `Invalid flyer format ${settings.format}!`
        }

        flyer.value = {
            id: uuidv4(),
            phases: [createPhase(settings, scheduler, [])],
        }
    }

    const createPhase = (settings: FlyerSettings, scheduler: IScheduler, players: Player[]): Phase => {
        if (players.length <= 0) {
            // use existing player entries if we can, else generate new ones
            const actualPlayerNames = settings.playerNames.slice(0, settings.playerCount)
            players = actualPlayerNames.map(n => ({
                id: uuidv4(),
                name: n,
            }))
        }

        const actualTables = settings.tables.slice(0, settings.tableCount)

        const phase: Phase = {
            id: settings.playOffId || uuidv4(),
            order: 1,
            players,
            tables: actualTables.map<Table>(t => ({ ...t, id: uuidv4() })),
            settings: {...settings}, // MEDIUM: reduce the amount of data added here
            startTime: Date.now(),
            finishTime: null,
            rounds: scheduler.generateFixtures(players),
        }

        for (const r of phase.rounds) {
            const walkovers = completeWalkovers(r, settings)

            for (const [fixtureId, winnerId] of walkovers) {
                // doing this just once is sufficient because we're not creating any fixtures
                // with a bye in both slots
                tryPropagate(phase, fixtureId, winnerId, false)
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

    const startFixture = (id: string, tableId: string, breakerId: string) => {
        for (const r of flyer.value!.phases.flatMap(p => p.rounds)) {
            const idx = r.fixtures.findIndex(f => f.id === id)
            if (idx >= 0) {
                r.fixtures[idx].startTime = Date.now()
                r.fixtures[idx].tableId = tableId
                r.fixtures[idx].breakerId = breakerId
            }
        }
    }

    const updateComment = (p: Phase, fixtureId: string, comment: string) => {
        const phase = flyer.value!.phases.find(x => x.id === p.id)
        if (!phase) {
            return
        }

        for (const r of phase.rounds) {
            const idx = r.fixtures.findIndex(f => f.id === fixtureId)
            if (idx >= 0) {
                r.fixtures[idx].comment = comment
            }
        }
    }

    const updateScores = (phase: Phase, fixtureId: string, scores: Score[], finishFixture: boolean) => {
        for (const r of phase.rounds) {
            const idx = r.fixtures.findIndex(f => f.id === fixtureId)
            if (idx >= 0) {
                r.fixtures[idx].scores = scores

                if (finishFixture) {
                    r.fixtures[idx].finishTime = Date.now()

                    if (winsRequiredReached(phase)) {
                        cancelRemaining()
                        finish(phase)
                        return
                    }

                    const winnerId = getWinner(r.fixtures[idx])
                    const loserId = getLoser(r.fixtures[idx])

                    if (!winnerId || !loserId) {
                        throw `Could not compute winner or loser of finished fixture ${fixtureId}!`
                    }

                    tryPropagate(phase, fixtureId, winnerId, false)
                    tryPropagate(phase, fixtureId, loserId, true)
                }
            }
        }
    }

    const winsRequiredReached = (phase: Phase) => {
        if (phase.settings.format !== Format.WinnerStaysOn) {
            return false
        }

        const standings = computeStandings(
            phase.rounds.flatMap(r => r.fixtures),
            phase.players,
            phase.settings
        )

        return standings[0].wins >= phase.settings.winsRequired
    }

    const generateRound = (phaseId: string, nextRoundIndex: number, winners: string[]) => {
        if (!flyer.value) {
            return
        }

        const shuffledPlayerIds = shuffle([...winners])

        const phase = flyer.value.phases.find(p => p.id === phaseId)!
        const round = phase.rounds.find(r => r.index === nextRoundIndex)!

        for (const f of round.fixtures) {
            for (const s of f.scores) {
                s.playerId = shuffledPlayerIds.pop()!
            }
        }

        round.isGenerated = true
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

    const finish = (p: Phase) => {
        const phase = flyer.value!.phases.find(x => x.id === p.id)
        if (!phase) {
            return false
        }

        if (!phase.finishTime) {
            phase.finishTime = Date.now()
        }

        return true
    }

    const addPlayOff = (playOff: PlayOff, forPhase: Phase) => {
        const settings = createPlayOffSettings(forPhase, playOff)

        const playOffPhase = createPhase(
            settings,
            new KnockoutScheduler(settings),
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
        generateRound,
        finish,
        cancelRemaining,
        addPlayOff,
        clear,
    }
})
