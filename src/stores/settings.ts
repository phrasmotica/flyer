import { computed, watch } from "vue"
import { defineStore } from "pinia"
import { useStorage } from "@vueuse/core"

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
    // TODO: simplify this store by storing a single object for all the settings,
    // rather than requiring one useStorage(...) call for each setting

    const playerCount = useStorage("playerCount", defaultPlayers.filter(p => p).length)
    const playerNames = useStorage("playerNames", defaultPlayers)

    const raceTo = useStorage("raceTo", 1)

    // TODO: use this to assign fixtures to tables
    const tableCount = useStorage("tableCount", 1)

    const format = useStorage("format", Format.Knockout)
    const formatOptions = [Format.Knockout, Format.RoundRobin]

    const requireCompletedRounds = useStorage("requireCompletedRounds", true)
    const allowEarlyFinish = useStorage("allowEarlyFinish", false)

    watch(format, () => {
        if (format.value === Format.Knockout) {
            requireCompletedRounds.value = true
            allowEarlyFinish.value = false
        }
    })

    const actualPlayers = computed(() => playerNames.value.slice(0, playerCount.value))

    const estimatedDuration = computed(() => new RoundRobinScheduler([]).estimateDuration(playerCount.value, raceTo.value, tableCount.value))

    const durationPerFrame = computed(() => new RoundRobinScheduler([]).frameTimeEstimateMins)

    const isInvalid = computed(() => actualPlayers.value.some(p => !p))

    const setPlayerCount = (n: number) => playerCount.value = n

    const setPlayers = (p: string[]) => playerNames.value = p

    const setName = (index: number, name: string) => {
        playerNames.value = playerNames.value.map((v, i) => i === index ? name : v)
    }

    const setRaceTo = (r: number) => raceTo.value = r

    const setTableCount = (t: number) => tableCount.value = t

    const reset = () => {
        setRaceTo(1)
        setTableCount(1)
    }

    return {
        playerNames,
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
