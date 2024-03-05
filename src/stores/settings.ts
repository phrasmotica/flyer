import { defineStore } from "pinia"
import { useStorage } from "@vueuse/core"

import { Format, type FlyerSettings, RuleSet, MoneySplit } from "../data/FlyerSettings"

const defaultPlayersEnv = import.meta.env.VITE_DEFAULT_PLAYERS
const maxPlayersEnv = Number(import.meta.env.VITE_MAX_PLAYERS)

let defaultPlayers = <string[]>[]
if (defaultPlayersEnv) {
    defaultPlayers = String(defaultPlayersEnv).split(";")
}

if (defaultPlayers.length < maxPlayersEnv) {
    defaultPlayers = [...defaultPlayers, ...new Array(maxPlayersEnv - defaultPlayers.length).fill("")]
}

export const useSettingsStore = defineStore("settings", () => {
    const settings = useStorage("settings", <FlyerSettings>{
        playerCount: defaultPlayers.filter(p => p).length,
        playerNames: defaultPlayers,
        raceTo: 1, // TODO: allow changing this per round in a Knockout tournament
        tableCount: 1, // TODO: use this to assign fixtures to tables
        format: Format.Knockout,
        ruleSet: RuleSet.Blackball,
        randomlyDrawAllRounds: false,
        requireCompletedRounds: true,
        allowDraws: false,
        allowEarlyFinish: false,
        entryFeeRequired: false,
        entryFee: 5,
        moneySplit: MoneySplit.WinnerTakesAll,
        tableCostPerHour: 9,
        name: "",
    })

    const setName = (index: number, name: string) => {
        settings.value.playerNames = settings.value.playerNames.map((v, i) => i === index ? name : v)
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

        setName,
        deleteName,
    }
})
