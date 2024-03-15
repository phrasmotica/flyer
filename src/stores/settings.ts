import { computed, watch } from "vue"
import { useStorage } from "@vueuse/core"
import { defineStore } from "pinia"

import { useListFallback } from "../composables/useListFallback"
import { useSettings } from "../composables/useSettings"

import { Format, type FlyerSettings, RuleSet, MoneySplit, TieBreaker } from "../data/FlyerSettings"
import type { Table } from "../data/Table"

const defaultPlayersEnv = import.meta.env.VITE_DEFAULT_PLAYERS
const maxPlayersEnv = Number(import.meta.env.VITE_MAX_PLAYERS)

export const formatList = [
    {
        value: Format.Knockout,
        name: "Knockout",
        summary: "Knockout format",
        details: "losers are immediately eliminated until one player remains",
    },
    {
        value: Format.RoundRobin,
        name: "Round-Robin",
        summary: "Round-Robin format",
        details: "every player plays against every other player once",
    },
    {
        value: Format.WinnerStaysOn,
        name: "Winner Stays On",
        summary: "Winner Stays On format",
        details: "gauntlet-style until one player has won enough matches",
    },
]

export const ruleSetList = [
    {
        value: RuleSet.Blackball,
        name: "Blackball",
        summary: "Blackball rules",
        details: "foul gives a free shot and a visit with ball-in-hand behind the baulk line, skill shots are permitted",
    },
    {
        value: RuleSet.International,
        name: "International",
        summary: "International rules",
        details: "foul gives one visit with ball-in-hand, skill shots and loss-of-turn shots are permitted",
    },
]

export const tieBreakerList = [
    {
        value: TieBreaker.HeadToHead,
        name: "Head-to-Head",
        summary: "Head-to-Head tie-breaker",
        details: "decided by the tied players' head-to-head records",
    },
    {
        value: TieBreaker.PlayOff,
        name: "Play-Off",
        summary: "Play-Off tie-breaker",
        details: "decided by a race-to-1 knockout play-off between the tied players",
    },
    {
        value: TieBreaker.Runouts,
        name: "Runouts",
        summary: "Runouts tie-breaker",
        details: "decided by the number of runouts made by the tied players",
    },
]

let defaultPlayers = <string[]>[]
if (defaultPlayersEnv) {
    defaultPlayers = String(defaultPlayersEnv).split(";")
}

const defaultPlayerCount = defaultPlayers.length
const defaultTableCount = Math.floor(defaultPlayerCount / 2)

if (defaultPlayers.length < maxPlayersEnv) {
    defaultPlayers = [...defaultPlayers, ...new Array(maxPlayersEnv - defaultPlayers.length).fill("")]
}

const maxTableCount = Math.floor(defaultPlayers.length / 2)
const defaultTables = new Array(maxTableCount).fill(0).map((_, i) => <Table>{
    id: "",
    name: "Table " + (i + 1),
    costPerHour: 9,
})

export const useSettingsStore = defineStore("settings", () => {
    const settings = useStorage("settings", <FlyerSettings>{
        playerCount: defaultPlayerCount,
        playerNames: defaultPlayers,
        raceTo: 1, // LOW: allow changing this per round in a Knockout tournament
        winsRequired: 1,
        tableCount: defaultTableCount,
        tables: defaultTables,
        format: Format.Knockout,
        ruleSet: RuleSet.Blackball,
        randomlyDrawAllRounds: false,
        requireCompletedRounds: true,
        allowDraws: false,
        allowEarlyFinish: false,
        stageCount: 1,
        entryFeeRequired: false,
        entryFee: 5,
        moneySplit: MoneySplit.WinnerTakesAll,
        tieBreaker: TieBreaker.HeadToHead,
        name: "",
    })

    const {
        isKnockout,
        isRoundRobin,
        isWinnerStaysOn,
    } = useSettings(settings.value)

    const {
        getFallback,
    } = useListFallback()

    watch(() => settings.value.playerCount, () => {
        if (settings.value.tableCount > Math.floor(settings.value.playerCount / 2)) {
            settings.value.tableCount = Math.floor(settings.value.playerCount / 2)
        }

        if (settings.value.winsRequired < settings.value.playerCount - 1) {
            // ensure everyone gets at least one game
            settings.value.winsRequired = settings.value.playerCount - 1
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

        if (isWinnerStaysOn.value) {
            settings.value.randomlyDrawAllRounds = false
            settings.value.requireCompletedRounds = false
            settings.value.allowDraws = false
            settings.value.allowEarlyFinish = true

            settings.value.tableCount = 1
        }
    })

    const moneySplitOptions = computed(() => [
        {
            value: MoneySplit.WinnerTakesAll,
            name: "Winner Takes All",
            disabled: false,
        },
        {
            value: MoneySplit.SeventyThirty,
            name: "70/30",
            disabled: false,
        },
        {
            value: MoneySplit.SixtyTwentyFiveFifteen,
            name: "60/25/15",
            disabled: settings.value.playerCount < 3,
        },
        {
            value: MoneySplit.SemiFinalists,
            name: "55/25/10/10",
            disabled: settings.value.playerCount < 4,
        },
    ])

    watch(moneySplitOptions, () => {
        const index = moneySplitOptions.value.findIndex(o => o.value === settings.value.moneySplit)
        settings.value.moneySplit = getFallback(moneySplitOptions.value, index, MoneySplit.WinnerTakesAll)
    })

    const deletePlayer = (index: number) => {
        if (settings.value.playerCount <= 2) {
            return
        }

        settings.value.playerCount = settings.value.playerCount - 1

        const newNames = [...settings.value.playerNames]
        newNames.splice(index, 1)
        newNames.push("")

        settings.value.playerNames = newNames
    }

    const deleteTable = (index: number) => {
        if (settings.value.tableCount <= 1) {
            return
        }

        settings.value.tableCount = settings.value.tableCount - 1

        const newTables = settings.value.tables.slice()
        newTables.splice(index, 1)
        newTables.push({
            id: "",
            name: "Table " + (newTables.length + 1),
            costPerHour: 9,
        })

        settings.value.tables = newTables
    }

    return {
        settings,

        formatList,
        ruleSetList,
        tieBreakerList,
        moneySplitOptions,

        deletePlayer,
        deleteTable,
    }
})
