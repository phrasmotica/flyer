import { computed, watch } from "vue"
import { useStorage } from "@vueuse/core"
import { defineStore } from "pinia"

import { useSettings } from "../composables/useSettings"

import { Format, type FlyerSettings, RuleSet, MoneySplit } from "../data/FlyerSettings"

const defaultPlayersEnv = import.meta.env.VITE_DEFAULT_PLAYERS
const maxPlayersEnv = Number(import.meta.env.VITE_MAX_PLAYERS)

const moneySplitList = [
    // MEDIUM: add a "disabled" property to these objects, and specify that
    // property to the Dropdown inside LabelledDropdown
    {
        value: MoneySplit.WinnerTakesAll,
        name: "Winner Takes All",
    },
    {
        value: MoneySplit.SeventyThirty,
        name: "70/30",
    },
    {
        value: MoneySplit.SixtyTwentyFiveFifteen,
        name: "60/25/15",
    },
    {
        value: MoneySplit.SemiFinalists,
        name: "45/25/15/15",
    },
]

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

    const moneySplitOptions = computed(() => {
        const exclusions = <MoneySplit[]>[]

        if (settings.value.playerCount < 4) {
            exclusions.push(MoneySplit.SemiFinalists)
        }

        if (settings.value.playerCount < 3) {
            exclusions.push(MoneySplit.SixtyTwentyFiveFifteen)
        }

        return moneySplitList.filter(m => !exclusions.includes(m.value))
    })

    watch(moneySplitOptions, () => {
        if (settings.value.moneySplit >= moneySplitOptions.value.length) {
            settings.value.moneySplit = moneySplitOptions.value.length - 1
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

        moneySplitOptions,

        setName,
        deleteName,
    }
})
