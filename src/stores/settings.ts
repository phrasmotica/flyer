import { watch } from "vue"
import { useStorage } from "@vueuse/core"
import { defineStore } from "pinia"

import { useSettings } from "../composables/useSettings"

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
        raceTo: 1, // LOW: allow changing this per round in a Knockout tournament
        tableCount: 1, // MEDIUM: use this to assign fixtures to tables
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

    const {
        isKnockout,
        isRoundRobin,
    } = useSettings(settings.value)

    watch(() => settings.value.playerCount, () => {
        if (settings.value.tableCount > Math.floor(settings.value.playerCount / 2)) {
            settings.value.tableCount = Math.floor(settings.value.playerCount / 2)
        }

        if (settings.value.playerCount === 2) {
            // MEDIUM: disable the other money split options if this happens
            settings.value.moneySplit = MoneySplit.WinnerTakesAll
        }
    })

    watch(() => settings.value.format, () => {
        if (isKnockout.value) {
            settings.value.requireCompletedRounds = true
            settings.value.allowEarlyFinish = false
            settings.value.allowDraws = false
        }

        if (isRoundRobin.value) {
            settings.value.randomlyDrawAllRounds = false
            settings.value.requireCompletedRounds = false
        }
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
