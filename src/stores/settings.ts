import { computed, ref, watch } from "vue"
import { defineStore } from "pinia"

import { RoundRobinScheduler } from "../data/RoundRobinScheduler"

export enum Format {
    Knockout = "Knockout",
    RoundRobin = "Round Robin",
}

const defaultPlayersEnv = import.meta.env.VITE_DEFAULT_PLAYERS

let defaultPlayers = <string[]>[]
if (defaultPlayersEnv) {
    defaultPlayers = String(defaultPlayersEnv).split(";")
}

if (defaultPlayers.length < 10) {
    defaultPlayers = [...defaultPlayers, ...new Array(10 - defaultPlayers.length).fill("")]
}

export const useSettingsStore = defineStore("settings", () => {
    const playerCount = ref(defaultPlayers.filter(p => p).length)
    const players = ref(defaultPlayers)

    const raceTo = ref(1)

    // TODO: use this to assign fixtures to tables
    const tableCount = ref(1)

    const format = ref(Format.Knockout)
    const formatOptions = ref([Format.Knockout, Format.RoundRobin])

    const requireCompletedRounds = ref(true)
    const allowEarlyFinish = ref(false)

    watch(format, () => {
        if (format.value === Format.Knockout) {
            requireCompletedRounds.value = true
            allowEarlyFinish.value = false
        }
    })

    const actualPlayers = computed(() => players.value.slice(0, playerCount.value))

    const estimatedDuration = computed(() => new RoundRobinScheduler([]).estimateDuration(playerCount.value, raceTo.value, tableCount.value))

    const durationPerFrame = computed(() => new RoundRobinScheduler([]).frameTimeEstimateMins)

    const isInvalid = computed(() => actualPlayers.value.some(p => !p))

    const setPlayerCount = (n: number) => playerCount.value = n

    const setPlayers = (p: string[]) => players.value = p

    const setName = (index: number, name: string) => {
        players.value = players.value.map((v, i) => i === index ? name : v)
    }

    const setRaceTo = (r: number) => raceTo.value = r

    const setTableCount = (t: number) => tableCount.value = t

    const reset = () => {
        setRaceTo(1)
        setTableCount(1)
    }

    return {
        players,
        raceTo,
        tableCount,
        format,
        formatOptions,
        requireCompletedRounds,
        allowEarlyFinish,

        playerCount,
        estimatedDuration,
        durationPerFrame,
        actualPlayers,
        isInvalid,

        setPlayerCount,
        setPlayers,
        setName,
        setRaceTo,
        setTableCount,
        reset,
    }
})
