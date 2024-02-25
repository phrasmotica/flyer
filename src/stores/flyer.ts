import { v4 as uuidv4 } from "uuid"

import { computed } from "vue"
import { useStorage } from "@vueuse/core"
import { differenceInSeconds } from "date-fns"
import { defineStore } from "pinia"

import type { Flyer } from "../data/Flyer"
import type { FlyerSettings } from "../data/FlyerSettings"
import type { IScheduler } from "../data/IScheduler"
import type { Result, Score } from "../data/Result"
import type { Round } from "../data/Round"

export const useFlyerStore = defineStore("flyer", () => {
    const flyer = useStorage<Flyer>("flyer", null, localStorage, {
        serializer: {
            read: v => JSON.parse(v) as Flyer,
            write: v => JSON.stringify(v),
        }
    })

    const players = computed(() => flyer.value?.players ?? [])

    const settings = computed(() => flyer.value?.settings)

    const rounds = computed(() => flyer.value?.rounds ?? [])

    const results = computed(() => rounds.value.flatMap(r => r.fixtures))

    const ongoingCount = computed(() => results.value.filter(f => f.startTime && !f.finishTime).length)
    const remainingCount = computed(() => results.value.filter(f => !f.finishTime).length)

    const currentRound = computed(() => {
        const oldestInProgressRound = rounds.value.find(r => r.fixtures.some(f => !f.finishTime))
        if (!oldestInProgressRound) {
            return 0
        }

        return oldestInProgressRound.index
    })

    const durationSeconds = computed(() => {
        if (!flyer.value?.startTime || !flyer.value?.finishTime) {
            return null
        }

        return differenceInSeconds(flyer.value.finishTime, flyer.value.startTime)
    })

    const winner = computed(() => {
        const finalRound = rounds.value[rounds.value.length - 1]
        if (finalRound) {
            const final = finalRound.fixtures[finalRound.fixtures.length - 1]
            const id = getWinner(final).playerId
            return players.value.find(p => p.id === id) || null
        }

        return null
    })

    const getRound = (resultId: string) => rounds.value.find(r => r.fixtures.some(f => f.id === resultId))

    const getPlayerName = (id: string) => players.value.find(p => p.id === id)?.name ?? id

    const start = (settings: FlyerSettings, scheduler: IScheduler) => {
        const actualPlayerNames = settings.playerNames.slice(0, settings.playerCount)
        const players = actualPlayerNames.map(n => ({
            id: uuidv4(),
            name: n,
        }))

        flyer.value = <Flyer>{
            id: uuidv4(),
            players,
            settings,
            startTime: null,
            finishTime: null,
            rounds: scheduler.generateFixtures(players),
        }

        flyer.value.startTime = Date.now()

        for (const r of flyer.value.rounds) {
            const walkovers = completeWalkovers(r)

            for (const [fixtureId, winnerId] of walkovers) {
                // doing this just once is sufficient because we're not creating any fixtures
                // with a bye in both slots
                propagate(fixtureId, winnerId)
            }
        }
    }

    const completeWalkovers = (round: Round) => {
        const ids: [string, string][] = []

        for (let f of round.fixtures) {
            const isWalkover = f.scores.some(s => s.isBye)
            if (isWalkover) {
                console.log("Walking over " + f.id)

                const now = Date.now()
                f.startTime = now
                f.finishTime = now

                const winner = f.scores.find(s => !s.isBye && s.playerId)
                if (!winner) {
                    throw "No winner of walkover " + f.id + "!"
                }

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

    const updateScores = (resultId: string, scores: Score[], finish: boolean) => {
        for (const r of flyer.value!.rounds) {
            const idx = r.fixtures.findIndex(f => f.id === resultId)
            if (idx >= 0) {
                r.fixtures[idx].scores = scores

                if (finish) {
                    r.fixtures[idx].finishTime = Date.now()
                    propagate(resultId, getWinner(r.fixtures[idx]).playerId)
                }
            }
        }
    }

    const getWinner = (f: Result) => f.scores.reduce((s, t) => s.score > t.score ? s : t)

    const propagate = (fixtureId: string, winnerId: string) => {
        for (const f of flyer.value!.rounds.flatMap(r => r.fixtures)) {
            const slotIndex = f.parentFixtureIds.indexOf(fixtureId)
            if (slotIndex >= 0) {
                f.scores[slotIndex].playerId = winnerId
            }
        }
    }

    const finish = () => {
        if (flyer.value && !flyer.value.finishTime) {
            flyer.value.finishTime = Date.now()
        }
    }

    const clear = () => flyer.value = null

    return {
        flyer,
        players,
        settings,
        rounds,
        results,
        ongoingCount,
        remainingCount,
        currentRound,
        durationSeconds,
        winner,

        getRound,
        getPlayerName,
        start,
        startFixture,
        updateScores,
        finish,
        clear,
    }
})
