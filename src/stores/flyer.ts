import { ref } from "vue"
import { useStorage } from "@vueuse/core"
import { defineStore } from "pinia"
import { v4 as uuidv4 } from "uuid"

import { useRankings } from "../composables/useRankings"

import type { Flyer } from "../data/Flyer"
import type { FlyerSettings } from "../data/FlyerSettings"
import type { IScheduler } from "../data/IScheduler"
import type { Player } from "../data/Player"
import type { Result, Score } from "../data/Result"
import type { Round } from "../data/Round"

const useFlyerStoreInternal = (name: string = "flyer") => defineStore(name, () => {
    const flyer = useStorage<Flyer | null>(name, null, localStorage, {
        serializer: {
            read: v => JSON.parse(v) as Flyer,
            write: v => JSON.stringify(v),
        }
    })

    const playerPool = ref<string[]>([])

    const {
        winsRequiredReached,
    } = useRankings()

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

        const newFlyer = <Flyer>{
            id: settings.playOffId || uuidv4(),
            players,
            settings,
            startTime: Date.now(),
            finishTime: null,
            rounds: scheduler.generateFixtures(players),
            playOffs: [],
        }

        for (const r of newFlyer.rounds) {
            const walkovers = completeWalkovers(r, settings)

            for (const [fixtureId, winnerId] of walkovers) {
                // doing this just once is sufficient because we're not creating any fixtures
                // with a bye in both slots
                const didPropagate = tryPropagate(newFlyer, fixtureId, winnerId, false)
                if (!didPropagate) {
                    // add winner to random draw pool for next round
                    playerPool.value = [...playerPool.value, winnerId]
                }
            }
        }

        return newFlyer
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

    const startFixture = (id: string) => {
        for (const r of flyer.value!.rounds) {
            const idx = r.fixtures.findIndex(f => f.id === id)
            if (idx >= 0) {
                r.fixtures[idx].startTime = Date.now()
            }
        }
    }

    const updateComment = (resultId: string, comment: string) => {
        for (const r of flyer.value!.rounds) {
            const idx = r.fixtures.findIndex(f => f.id === resultId)
            if (idx >= 0) {
                r.fixtures[idx].comment = comment
            }
        }
    }

    const updateScores = (resultId: string, scores: Score[], finishFixture: boolean) => {
        for (const r of flyer.value!.rounds) {
            const idx = r.fixtures.findIndex(f => f.id === resultId)
            if (idx >= 0) {
                r.fixtures[idx].scores = scores

                if (finishFixture) {
                    r.fixtures[idx].finishTime = Date.now()

                    if (winsRequiredReached(flyer.value!.rounds.flatMap(r => r.fixtures), flyer.value!.players, flyer.value!.settings)) {
                        cancelRemaining()
                        finish()
                        return
                    }

                    const didPropagateWinner = tryPropagate(flyer.value!, resultId, getWinner(r.fixtures[idx]).playerId, false)
                    if (!didPropagateWinner) {
                        // add winner to random draw pool for next round
                        playerPool.value = [...playerPool.value, getWinner(r.fixtures[idx]).playerId]
                    }

                    tryPropagate(flyer.value!, resultId, getLoser(r.fixtures[idx]).playerId, true)
                }
            }
        }
    }

    const generateNextRound = () => {
        if (!flyer.value) {
            return
        }

        const shuffledPlayerIds =  shuffle([...playerPool.value])

        const nextRound = flyer.value.rounds.find(r => !r.isGenerated)!
        for (const f of nextRound.fixtures) {
            for (const s of f.scores) {
                s.playerId = shuffledPlayerIds.pop()!
            }
        }

        nextRound.isGenerated = true

        playerPool.value = []
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

    const getWinner = (f: Result) => f.scores.reduce((s, t) => s.score > t.score ? s : t)

    const getLoser = (f: Result) => f.scores.reduce((s, t) => s.score < t.score ? s : t)

    const tryPropagate = (flyer: Flyer, fixtureId: string, playerId: string, takeLoser: boolean) => {
        for (const f of flyer.rounds.flatMap(r => r.fixtures)) {
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

        const remainingFixtures = flyer.value.rounds
            .flatMap(r => r.fixtures)
            .filter(f => !f.startTime && !f.finishTime && !f.cancelledTime)

        for (const f of remainingFixtures) {
            f.cancelledTime = Date.now()
        }
    }

    const finish = () => {
        if (flyer.value) {
            if (!flyer.value.finishTime) {
                flyer.value.finishTime = Date.now()
            }

            return true
        }

        return false
    }

    const addPlayOff = (playOff: Flyer) => {
        if (flyer.value) {
            flyer.value.playOffs = [...flyer.value.playOffs, playOff]
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

export const useFlyerStore = useFlyerStoreInternal()

export const usePlayOffStore = useFlyerStoreInternal("playOff")
