import { computed, watch } from "vue"
import { useStorage } from "@vueuse/core"
import { defineStore } from "pinia"

import { useListFallback } from "@/composables/useListFallback"
import { usePhaseSettings } from "@/composables/usePhaseSettings"

import type { FlyerSettings } from "@/data/FlyerSettings"
import { Format, RuleSet, MoneySplit, TieBreaker, MatchLengthModel } from "@/data/PhaseSettings"
import type { SettingsDetails } from "@/data/SettingsDetails"
import type { Table } from "@/data/Table"

const defaultPlayersEnv = import.meta.env.VITE_DEFAULT_PLAYERS
const maxPlayersEnv = Number(import.meta.env.VITE_MAX_PLAYERS)

export const matchLengthModelList: SettingsDetails<MatchLengthModel>[] = [
    {
        value: MatchLengthModel.Fixed,
        name: "Fixed",
        summary: "Fixed races",
        details: "",
    },
    {
        value: MatchLengthModel.Variable,
        name: "Variable",
        summary: "Variable races",
        details: "",
    },
]

export const formatList: SettingsDetails<Format>[] = [
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
        details: "every player plays against every other player",
    },
    {
        value: Format.WinnerStaysOn,
        name: "Winner Stays On",
        summary: "Winner Stays On format",
        details: "gauntlet-style until one player has won enough matches",
    },
]

export const ruleSetList: SettingsDetails<RuleSet>[] = [
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

export const tieBreakerList: SettingsDetails<TieBreaker>[] = [
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

while (defaultPlayers.length < maxPlayersEnv) {
    defaultPlayers.push("Player " + (defaultPlayers.length + 1))
}

const maxTableCount = Math.floor(defaultPlayers.length / 2)
const defaultTables = new Array(maxTableCount).fill(0).map<Table>((_, i) => ({
    id: "",
    name: "Table " + (i + 1),
    costPerHour: 9,
}))

const defaultSettings: FlyerSettings = {
    playerCount: defaultPlayerCount,
    playerNames: defaultPlayers,
    raceToPerRound: [],
    tableCount: defaultTableCount,
    tables: defaultTables,
    specification: {
        matchLengthModel: MatchLengthModel.Fixed,
        raceTo: 1,
        winsRequired: 1,
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
    }
    // HIGH: allow a flyer to have multiple phases, e.g. round-robin then a knockout final between the top 2
}

const expectedKnockoutRoundsCount = Math.ceil(Math.log2(maxPlayersEnv))
defaultSettings.raceToPerRound = new Array(expectedKnockoutRoundsCount).fill(defaultSettings.specification.raceTo)

export const useSettingsStore = defineStore("settings", () => {
    const settings = useStorage("settings", defaultSettings)

    const {
        isKnockout,
        isRoundRobin,
        isWinnerStaysOn,
    } = usePhaseSettings(settings.value.specification)

    const {
        getFallback,
    } = useListFallback()

    watch(() => settings.value.playerCount, () => {
        if (settings.value.tableCount > Math.floor(settings.value.playerCount / 2)) {
            settings.value.tableCount = Math.floor(settings.value.playerCount / 2)
        }

        if (settings.value.specification.winsRequired < settings.value.playerCount - 1) {
            // ensure everyone gets at least one game
            settings.value.specification.winsRequired = settings.value.playerCount - 1
        }
    })

    watch(() => settings.value.specification.format, () => {
        if (isKnockout.value) {
            settings.value.specification.requireCompletedRounds = true
            settings.value.specification.allowEarlyFinish = false
            settings.value.specification.allowDraws = false
        }

        if (isRoundRobin.value) {
            settings.value.specification.matchLengthModel = MatchLengthModel.Fixed

            settings.value.specification.randomlyDrawAllRounds = false
            settings.value.specification.requireCompletedRounds = false
        }

        if (isWinnerStaysOn.value) {
            settings.value.specification.matchLengthModel = MatchLengthModel.Fixed
            settings.value.tableCount = 1

            settings.value.specification.randomlyDrawAllRounds = false
            settings.value.specification.requireCompletedRounds = false
            settings.value.specification.allowDraws = false
            settings.value.specification.allowEarlyFinish = true
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
        const index = moneySplitOptions.value.findIndex(o => o.value === settings.value.specification.moneySplit)
        settings.value.specification.moneySplit = getFallback(moneySplitOptions.value, index, MoneySplit.WinnerTakesAll)
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

        matchLengthModelList,
        formatList,
        ruleSetList,
        tieBreakerList,
        moneySplitOptions,

        deletePlayer,
        deleteTable,
    }
})
