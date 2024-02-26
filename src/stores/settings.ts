import { computed } from "vue"
import { defineStore } from "pinia"
import { useStorage } from "@vueuse/core"

import { Format, type FlyerSettings, RuleSet } from "../data/FlyerSettings"
import { RoundRobinScheduler } from "../data/RoundRobinScheduler"
import { KnockoutScheduler } from "@/data/KnockoutScheduler"

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
        ruleSet: RuleSet.Blackball,
        requireCompletedRounds: true,
        allowDraws: false,
        allowEarlyFinish: false,
        name: "",
    })

    const playerNames = computed(() => settings.value.playerNames)

    const estimatedDuration = computed(() => {
        switch (settings.value.format) {
            case Format.Knockout:
                return new KnockoutScheduler().estimateDuration(settings.value)

            case Format.RoundRobin:
                return new RoundRobinScheduler().estimateDuration(settings.value)

            default:
                throw `Invalid flyer format ${settings.value.format}!`
        }
    })

    const durationPerFrame = computed(() => {
        switch (settings.value.format) {
            case Format.Knockout:
                return new KnockoutScheduler().frameTimeEstimateMins

            case Format.RoundRobin:
                return new RoundRobinScheduler().frameTimeEstimateMins

            default:
                throw `Invalid flyer format ${settings.value.format}!`
        }
    })

    const isInvalid = computed(() => {
        const actualPlayerNames = playerNames.value.slice(0, settings.value.playerCount)
        return actualPlayerNames.some(p => !p)
    })

    const setName = (index: number, name: string) => {
        settings.value.playerNames = playerNames.value.map((v, i) => i === index ? name : v)
    }

    const deleteName = (index: number) => {
        if (settings.value.playerCount <= 2) {
            return
        }

        settings.value.playerCount = settings.value.playerCount - 1

        const newNames = [...settings.value.playerNames]
        newNames.splice(index, 1)
        newNames.push("")

        settings.value.playerNames = newNames
    }

    return {
        settings,

        estimatedDuration,
        durationPerFrame,
        isInvalid,

        setName,
        deleteName,
    }
})