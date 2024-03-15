import { computed } from "vue"
import { useStorage } from "@vueuse/core"
import { defineStore } from "pinia"
import { v4 as uuidv4 } from "uuid"

import { useArray } from "../composables/useArray"
import { useRankings } from "../composables/useRankings"

import type { Fixture, Score } from "../data/Fixture"
import type { Flyer } from "../data/Flyer"
import type { FlyerSettings } from "../data/FlyerSettings"
import type { IScheduler } from "../data/IScheduler"
import type { Phase } from "../data/Phase"
import type { Player } from "../data/Player"
import type { Round } from "../data/Round"
import type { Table } from "../data/Table"

const useFlyerStoreInternal = (name: string = "flyer") => defineStore(name, () => {
    const flyer = useStorage<Flyer | null>(name, null, localStorage, {
        serializer: {
            read: v => JSON.parse(v) as Flyer,
            write: v => JSON.stringify(v),
        }
    })

    const [playerPool, addToPlayerPool,, clearPlayerPool] = useArray<string>()

    const {
        winsRequiredReached,
    } = useRankings()

    const currentPhase = computed(() => flyer.value?.phases[0] || null)

    const setFlyer = (f: Flyer) => {
        flyer.value = f
    }

    const start = (settings: FlyerSettings, scheduler: IScheduler, players: Player[]) => {
        flyer.value = createFlyer(settings, scheduler, players)
    }

    const createFlyer = (settings: FlyerSettings, scheduler: IScheduler, players: Player[]) => {
        if (players.length <= 0) {
            // use existing player entries if we can, else generate new ones
            const actualPlayerNames = settings.playerNames.slice(0, settings.playerCount)
            players = actualPlayerNames.map(n => ({
                id: uuidv4(),
                name: n,
            }))
        }

        const actualTables = settings.tables.slice(0, settings.tableCount)

        const firstPhase = <Phase>{
            id: settings.playOffId || uuidv4(),
            order: 1,
            players,
            tables: actualTables.map(t => <Table>{ ...t, id: uuidv4() }),
            settings,
            startTime: Date.now(),
            finishTime: null,
            rounds: scheduler.generateFixtures(players),
            playOffs: [],
        }

        for (const r of firstPhase.rounds) {
            const walkovers = completeWalkovers(r, settings)

            for (const [fixtureId, winnerId] of walkovers) {
                // doing this just once is sufficient because we're not creating any fixtures
                // with a bye in both slots
                const didPropagate = tryPropagate(firstPhase, fixtureId, winnerId, false)
                if (!didPropagate) {
                    // add winner to random draw pool for next round
                    addToPlayerPool(winnerId)
                }
            }
        }

        return <Flyer>{
            id: uuidv4(),
            phases: [firstPhase],
        }
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
        const phase = flyer.value!.phases[0]

        for (const r of phase.rounds) {
            const idx = r.fixtures.findIndex(f => f.id === fixtureId)
            if (idx >= 0) {
                r.fixtures[idx].scores = scores

                if (finishFixture) {
                    r.fixtures[idx].finishTime = Date.now()

                    if (winsRequiredReached(
                        flyer.value!.phases.flatMap(p => p.rounds).flatMap(r => r.fixtures),
                        flyer.value!.phases[0].players,
                        flyer.value!.phases[0].settings)) {
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
        if (flyer.value) {
            if (!flyer.value.phases[0].finishTime) {
                flyer.value.phases[0].finishTime = Date.now()
            }

            return true
        }

        return false
    }

    const addPlayOff = (playOff: Phase) => {
        if (flyer.value?.phases[0]) {
            flyer.value.phases[0].playOffs = [...flyer.value.phases[0].playOffs, playOff]
        }
    }

    const clear = () => flyer.value = null

    return {
        flyer,
        setFlyer,

        currentPhase,

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

export const useFlyerStore = useFlyerStoreInternal()

export const usePlayOffStore = useFlyerStoreInternal("playOff")
