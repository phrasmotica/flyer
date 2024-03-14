import { computed, ref, watch } from "vue"
import { useIntervalFn } from "@vueuse/core"
import { differenceInMinutes, differenceInSeconds } from "date-fns"

import type { Flyer } from "../data/Flyer"
import { type FlyerSettings } from "../data/FlyerSettings"

// LOW: ideally this would not have to accept null, but we use it in places
// where the argument can currently be null (see ResultsTable.vue)
export const useFlyer = (f: Flyer | null) => {
    const flyer = ref(f)

    const fixtures = computed(() => flyer.value?.rounds.flatMap(r => r.fixtures) || [])
    const players = computed(() => flyer.value?.players || [])
    const tables = computed(() => flyer.value?.tables || [])
    const settings = computed(() => flyer.value?.settings || <FlyerSettings>{})
    const rounds = computed(() => flyer.value?.rounds || [])
    const playOffs = computed(() => flyer.value?.playOffs || [])

    const hasStarted = computed(() => !!flyer.value?.startTime)
    const hasFinished = computed(() => !!flyer.value?.finishTime)
    const isInProgress = computed(() => hasStarted.value && !hasFinished.value)

    const isComplete = computed(() => fixtures.value.every(x => x.startTime && x.finishTime))
    const remainingCount = computed(() => fixtures.value.filter(f => !f.finishTime && !f.cancelledTime).length)

    const currentRound = computed(() => {
        const notCompletedRounds = rounds.value.filter(r => r.fixtures.some(f => !f.startTime || !f.finishTime))
        return notCompletedRounds.find(r => r.fixtures.some(f => f.startTime && !f.finishTime)) || notCompletedRounds[0]
    })

    const nextRound = computed(() => rounds.value.find(r => r.index === currentRound.value.index + 1))

    const generationIsComplete = computed(() => rounds.value.every(r => r.isGenerated))

    const readyForNextRound = computed(() => {
        if (!settings.value.randomlyDrawAllRounds) {
            return false
        }

        // don't want to include the always-generated final round, so
        // use a take-while approach
        const generatedRounds = takeWhile([...rounds.value], r => r.isGenerated)
        if (generatedRounds.length >= rounds.value.length) {
            return false
        }

        const currentRound = generatedRounds[generatedRounds.length - 1]
        return currentRound.fixtures.every(f => f.startTime && f.finishTime)
    })

    const durationMinutes = computed(() => {
        if (!flyer.value?.startTime || !flyer.value.finishTime) {
            return null
        }

        return differenceInMinutes(flyer.value.finishTime, flyer.value.startTime)
    })

    const durationSeconds = computed(() => {
        if (!flyer.value?.startTime || !flyer.value.finishTime) {
            return null
        }

        return differenceInSeconds(flyer.value.finishTime, flyer.value.startTime)
    })

    const clockDisplay = computed(() => durationSeconds.value || elapsedSeconds.value)

    const nextFreeTable = computed(() => {
        const freeTables = tables.value.filter(t => !fixtures.value.some(f => f.tableId === t.id && !f.finishTime))
        return freeTables.at(0)
    })

    const isBusy = (playerId: string) => {
        return rounds.value.flatMap(r => r.fixtures).some(f => {
            const isInProgress = f.startTime && !f.finishTime
            return isInProgress && f.scores.some(s => s.playerId === playerId)
        })
    }

    const getPlayerName = (id: string) => players.value.find(p => p.id === id)?.name ?? id

    const getTableName = (id: string) => tables.value.find(p => p.id === id)?.name ?? id

    const getRound = (fixtureId: string) => rounds.value.find(r => r.fixtures.some(f => f.id === fixtureId))

    const playOffIsComplete = (id: string) => playOffs.value.some(p => p.id === id)

    const computeDifference = () => differenceInSeconds(Date.now(), flyer.value?.startTime || Date.now())

    const elapsedSeconds = ref(computeDifference())

    const updateClock = () => {
        const newValue = computeDifference()
        console.debug("FlyerClock " + settings.value.name + ": " + flyer.value?.startTime + " + " + newValue)
        elapsedSeconds.value = newValue
    }

    watch(flyer, () => {
        updateClock()

        if (flyer.value?.startTime) {
            resumeClock()
        }
    })

    const clock = useIntervalFn(updateClock, 1000, {
        immediate: false,
    })

    const pauseClock = clock.pause
    const resumeClock = clock.resume

    const takeWhile = <T>(arr: T[], pred: (x: T) => boolean): T[] => {
        if (arr.length <= 0) {
            return []
        }

        return pred(arr[0]) ? [arr[0], ...takeWhile(arr.slice(1, -1), pred)] : []
    }

    return {
        flyer,

        fixtures,
        players,
        settings,
        rounds,
        playOffs,

        elapsedSeconds,
        hasStarted,
        hasFinished,
        isInProgress,
        isComplete,
        remainingCount,
        currentRound,
        nextRound,
        generationIsComplete,
        readyForNextRound,
        durationMinutes,
        durationSeconds,
        clockDisplay,
        nextFreeTable,

        isBusy,
        getPlayerName,
        getTableName,
        getRound,
        playOffIsComplete,
        pauseClock,
        resumeClock,
    }
}
