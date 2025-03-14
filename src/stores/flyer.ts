import { useStorage } from "@vueuse/core"
import { defineStore } from "pinia"
import { v4 as uuidv4 } from "uuid"

import { useRankings } from "@/composables/useRankings"

import type { Fixture, Score } from "@/data/Fixture"
import type { FixtureSwap } from "@/data/FixtureSwap"
import type { Flyer } from "@/data/Flyer"
import type { FlyerSettings } from "@/data/FlyerSettings"
import type { IScheduler } from "@/data/IScheduler"
import { KnockoutScheduler } from "@/data/KnockoutScheduler"
import type { Phase } from "@/data/Phase"
import { PhaseEventLevel, type PhaseEvent } from "@/data/PhaseEvent"
import type { Player } from "@/data/Player"
import type { PlayerRecord } from "@/data/PlayerRecord"
import type { Round } from "@/data/Round"
import { RoundRobinScheduler } from "@/data/RoundRobinScheduler"
import { Format, createPlayOffSettings } from "@/data/Specification"
import type { Table } from "@/data/Table"
import type { TieBreakerInfo } from "@/data/TieBreakerInfo"
import { WinnerStaysOnScheduler } from "@/data/WinnerStaysOnScheduler"

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

        switch (settings.specification.format) {
            case Format.Knockout:
                scheduler = new KnockoutScheduler()
                break

            case Format.RoundRobin:
                scheduler = new RoundRobinScheduler()
                break

            case Format.WinnerStaysOn:
                scheduler = new WinnerStaysOnScheduler()
                break

            default:
                throw `Invalid flyer format ${settings.specification.format}!`
        }

        const mainPhase = createPhase(settings, scheduler, [])

        const now = Date.now()
        mainPhase.startTime = now

        flyer.value = {
            id: uuidv4(),
            startTime: now,
            finishTime: null,
            phases: [mainPhase],
            ranking: [],
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
            id: uuidv4(),
            order: 1,
            players,
            tables: actualTables.map<Table>(t => ({ ...t, id: uuidv4() })),
            settings: {...settings.specification},
            startTime: null,
            finishTime: null,
            skippedTime: null,
            rounds: scheduler.generateFixtures(settings, players),
            fixtureSwaps: [],
            eventLog: createEventLog(settings.specification.name),
            ranking: [],
            tieBreakers: [],
        }

        for (const r of phase.rounds) {
            const walkovers = completeWalkovers(r, settings.specification.raceTo)

            for (const [fixtureId, winnerId] of walkovers) {
                // doing this just once is sufficient because we're not creating any fixtures
                // with a bye in both slots
                tryPropagate(phase, fixtureId, winnerId, false)
            }
        }

        return phase
    }

    const createPlayOffPhase = (forPhase: Phase, tieBreaker: TieBreakerInfo, raceTo: number) => {
        const settings = createPlayOffSettings(forPhase, tieBreaker, raceTo)

        const newPhase: Phase = {
            id: tieBreaker.id,
            order: 1, // this will be assigned if the phase gets added to the flyer
            players: tieBreaker.players,
            tables: forPhase.tables,
            settings: {...settings},
            startTime: Date.now(),
            finishTime: null,
            skippedTime: null,
            rounds: new KnockoutScheduler().generatePlayOffFixtures(forPhase, tieBreaker.players, raceTo),
            fixtureSwaps: [],
            eventLog: createEventLog(settings.name),
            ranking: [],
            tieBreakers: [],
        }

        for (const r of newPhase.rounds) {
            const walkovers = completeWalkovers(r, settings.raceTo)

            for (const [fixtureId, winnerId] of walkovers) {
                // doing this just once is sufficient because we're not creating any fixtures
                // with a bye in both slots
                tryPropagate(newPhase, fixtureId, winnerId, false)
            }
        }

        return newPhase
    }

    const createEventLog = (phaseName: string): PhaseEvent[] => {
        return [
            {
                level: PhaseEventLevel.Default,
                message: `${phaseName} has started.`,
                timestamp: Date.now(),
            },
        ]
    }

    const addPhaseEvent = (phase: Phase, message: string, level = PhaseEventLevel.Default) => {
        phase.eventLog.push({
            level,
            message,
            timestamp: Date.now(),
        })
    }

    const completeWalkovers = (round: Round, raceTo: number) => {
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

                winner.score = raceTo

                ids.push([f.id, winner.playerId])
            }
        }

        return ids
    }

    const assignTable = (phase: Phase, id: string, tableId: string, addEvent = true) => {
        for (const r of phase.rounds) {
            const idx = r.fixtures.findIndex(f => f.id === id)
            if (idx >= 0) {
                r.fixtures[idx].tableId = tableId

                if (addEvent) {
                    addPhaseEvent(phase, `Fixture ${id} was assigned to table ${tableId}.`, PhaseEventLevel.Internal)
                }
            }
        }
    }

    const assignBreaker = (phase: Phase, id: string, breakerId: string, addEvent = true) => {
        for (const r of phase.rounds) {
            const idx = r.fixtures.findIndex(f => f.id === id)
            if (idx >= 0) {
                r.fixtures[idx].breakerId = breakerId

                if (addEvent) {
                    addPhaseEvent(phase, `${breakerId} will break first in fixture ${id}.`, PhaseEventLevel.Internal)
                }
            }
        }
    }

    const startFixture = (phase: Phase, id: string, addEvent = true) => {
        for (const r of phase.rounds) {
            const idx = r.fixtures.findIndex(f => f.id === id)
            if (idx >= 0) {
                r.fixtures[idx].startTime = Date.now()

                if (addEvent) {
                    addPhaseEvent(phase, `Fixture ${id} was started.`, PhaseEventLevel.Internal)
                }
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

    const updateIsExcluded = (p: Phase, fixtureId: string, isExcluded: boolean) => {
        const phase = flyer.value!.phases.find(x => x.id === p.id)
        if (!phase) {
            return
        }

        for (const r of phase.rounds) {
            const idx = r.fixtures.findIndex(f => f.id === fixtureId)
            if (idx >= 0) {
                r.fixtures[idx].isExcluded = isExcluded
            }
        }
    }

    const updateScores = (
        phase: Phase,
        fixtureId: string,
        scores: Score[],
        finishFixture: boolean,
        addEvent = true,
    ) => {
        for (const r of phase.rounds) {
            const idx = r.fixtures.findIndex(f => f.id === fixtureId)
            if (idx >= 0) {
                r.fixtures[idx].scores = scores

                if (finishFixture) {
                    r.fixtures[idx].finishTime = Date.now()

                    if (addEvent) {
                        addPhaseEvent(phase, `Fixture ${fixtureId} was finished.`, PhaseEventLevel.Internal)
                    }

                    if (winsRequiredReached(phase)) {
                        return true
                    }

                    const winnerId = getWinner(r.fixtures[idx])
                    const loserId = getLoser(r.fixtures[idx])

                    if (winnerId) {
                        tryPropagate(phase, fixtureId, winnerId, false)
                    }

                    if (loserId) {
                        tryPropagate(phase, fixtureId, loserId, true)
                    }
                }
            }
        }

        return false
    }

    const addTable = (name: string, costPerHour: number) => {
        if (flyer.value?.phases[0]) {
            flyer.value.phases[0].tables = [
                ...flyer.value.phases[0].tables,
                {
                    id: uuidv4(),
                    name,
                    costPerHour,
                },
            ]
        }
    }

    const winsRequiredReached = (phase: Phase) => {
        if (phase.settings.format !== Format.WinnerStaysOn) {
            return false
        }

        const standings = computeStandings(phase, false)
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

    const finishPhase = (phase: Phase, ranking: PlayerRecord[], tieBreakers: TieBreakerInfo[]) => {
        if (!phase.finishTime) {
            phase.finishTime = Date.now()
            phase.ranking = ranking
            phase.tieBreakers = tieBreakers

            addPhaseEvent(phase, `${phase.settings.name} was finished.`)
        }

        return true
    }

    const addPlayOff = (forPhase: Phase, tieBreaker: TieBreakerInfo, raceTo: number) => {
        if (flyer.value) {
            const playOffPhase = createPlayOffPhase(forPhase, tieBreaker, raceTo)

            const maxOrder = flyer.value.phases.map(p => p.order).reduce((x, y) => Math.max(x, y))
            playOffPhase.order = maxOrder + 1

            flyer.value.phases = [...flyer.value.phases, playOffPhase]
        }
    }

    const skipPlayOff = (forPhase: Phase, tieBreaker: TieBreakerInfo, ranking: PlayerRecord[]) => {
        if (flyer.value) {
            const playOffPhase = createPlayOffPhase(forPhase, tieBreaker, 1)

            const maxOrder = flyer.value.phases.map(p => p.order).reduce((x, y) => Math.max(x, y))
            playOffPhase.order = maxOrder + 1

            playOffPhase.skippedTime = Date.now()
            playOffPhase.ranking = ranking

            addPhaseEvent(playOffPhase, `${playOffPhase.settings.name} was skipped.`, PhaseEventLevel.Internal)

            flyer.value.phases = [...flyer.value.phases, playOffPhase]
        }
    }

    const finish = (ranking: PlayerRecord[]) => {
        if (flyer.value) {
            flyer.value.finishTime = Date.now()
            flyer.value.ranking = ranking
        }
    }

    const clear = () => flyer.value = null

    const autoStartFixture = (phase: Phase, fixture: Fixture, tableId: string) => {
        console.debug("Auto-starting fixture " + fixture.id)

        const breakerId = getRandom(fixture.scores).playerId

        assignTable(phase, fixture.id, tableId, false)
        assignBreaker(phase, fixture.id, breakerId, false)
        startFixture(phase, fixture.id, false)

        addPhaseEvent(phase, `Fixture ${fixture.id} was auto-started.`, PhaseEventLevel.Internal)
    }

    const autoCompleteFixture = (
        phase: Phase,
        fixture: Fixture,
        tableId: string,
        dummyScore: number,
        allowDraws: boolean,
    ) => {
        console.debug("Auto-completing fixture " + fixture.id)

        const breakerId = getRandom(fixture.scores).playerId
        const winnerId = getRandom(fixture.scores).playerId

        const isDraw = allowDraws && Math.floor(Math.random() * 3) === 0

        const newScores = fixture.scores.map(s => ({
            ...s,
            score: isDraw ? dummyScore - 1 : s.playerId === winnerId ? dummyScore : 0,
        }))

        assignTable(phase, fixture.id, tableId, false)
        assignBreaker(phase, fixture.id, breakerId, false)
        startFixture(phase, fixture.id, false)

        updateComment(phase, fixture.id, "AUTO-COMPLETED")

        const isFinishedEarly = updateScores(phase, fixture.id, newScores, true, false)

        addPhaseEvent(phase, `Fixture ${fixture.id} was auto-completed.`, PhaseEventLevel.Internal)

        if (isFinishedEarly) {
            cancelRemaining()
            return true
        }

        return false
    }

    const autoCompletePhase = (
        phase: Phase,
        tableId: string,
        dummyScore: number,
        allowDraws: boolean,
    ) => {
        const fixtures = phase.rounds.flatMap(r => r.fixtures)

        for (const f of fixtures.filter(f => !f.startTime)) {
            const isFinishedEarly = autoCompleteFixture(phase, f, tableId, dummyScore, allowDraws)
            if (isFinishedEarly) {
                break
            }
        }

        addPhaseEvent(phase, `${phase.settings.name} was auto-completed.`, PhaseEventLevel.Internal)
    }

    const swapFixtures = (phase: Phase, swap: FixtureSwap) => {
        console.debug(`Swapping round ${swap.roundAIndex} fixture ${swap.fixtureAIndex} and round ${swap.roundBIndex} fixture ${swap.fixtureBIndex}`)

        const roundA = phase.rounds.find(r => r.index === swap.roundAIndex)!
        const roundB = phase.rounds.find(r => r.index === swap.roundBIndex)!

        const temp = roundA.fixtures[swap.fixtureAIndex]
        roundA.fixtures[swap.fixtureAIndex] = roundB.fixtures[swap.fixtureBIndex]
        roundB.fixtures[swap.fixtureBIndex] = temp

        phase.fixtureSwaps.push({
            ...swap,
            id: uuidv4(),
            timestamp: Date.now(),
        })

        addPhaseEvent(phase, `Fixture ${swap.fixtureBId} was prioritised in place of fixture ${swap.fixtureAId}.`, PhaseEventLevel.Internal)

        return true
    }

    const resetPlayOffs = () => {
        if (flyer.value && flyer.value.phases.length >= 2) {
            flyer.value.phases = [flyer.value.phases[0]]
        }
    }

    const getRandom = <T>(arr: T[]) => {
        return arr[Math.floor(Math.random() * arr.length)]
    }

    return {
        flyer,
        setFlyer,

        start,
        assignTable,
        assignBreaker,
        startFixture,
        addPhaseEvent,
        updateComment,
        updateIsExcluded,
        updateScores,
        addTable,
        generateRound,
        finishPhase,
        cancelRemaining,
        addPlayOff,
        skipPlayOff,
        finish,
        clear,

        autoStartFixture,
        autoCompleteFixture,
        autoCompletePhase,
        swapFixtures,
        resetPlayOffs,
    }
})
