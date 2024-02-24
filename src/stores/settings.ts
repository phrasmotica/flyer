import { computed, watch } from "vue"
import { defineStore } from "pinia"
import { useStorage } from "@vueuse/core"

import { Format, type FlyerSettings } from "../data/FlyerSettings"
import { RoundRobinScheduler } from "../data/RoundRobinScheduler"

const defaultPlayersEnv = import.meta.env.VITE_DEFAULT_PLAYERS

let defaultPlayers = <string[]>[]
if (defaultPlayersEnv) {
    defaultPlayers = String(defaultPlayersEnv).split(";")
}

if (defaultPlayers.length < 10) {
    defaultPlayers = [...defaultPlayers, ...new Array(10 - defaultPlayers.length).fill("")]
}

export const useSettingsStore = defineStore("settings", () => {
    const settings = useStorage("settings", <FlyerSettings>{
        playerCount: defaultPlayers.filter(p => p).length,
        playerNames: defaultPlayers,
        raceTo: 1,
        tableCount: 1, // TODO: use this to assign fixtures to tables
        format: Format.Knockout,
        requireCompletedRounds: true,
        allowEarlyFinish: false,
    })

    const playerNames = computed(() => settings.value.playerNames)

    watch(settings, () => {
        if (settings.value.format === Format.Knockout) {
            settings.value.requireCompletedRounds = true
            settings.value.allowEarlyFinish = false
        }
    })

    const actualPlayers = computed(() => playerNames.value.slice(0, settings.value.playerCount))

    const estimatedDuration = computed(() => new RoundRobinScheduler().estimateDuration(settings.value))

    const durationPerFrame = computed(() => new RoundRobinScheduler().frameTimeEstimateMins)

    const isInvalid = computed(() => actualPlayers.value.some(p => !p))

    const setName = (index: number, name: string) => {
        settings.value.playerNames = playerNames.value.map((v, i) => i === index ? name : v)
    }

    return {
        settings,

        estimatedDuration,
        durationPerFrame,
        actualPlayers,
        isInvalid,

        setName,
    }
})
