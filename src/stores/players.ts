import { useStorage } from "@vueuse/core"
import { defineStore } from "pinia"
import { v4 as uuidv4 } from "uuid"

import type { Player } from "../data/Player"

export const usePlayersStore = defineStore("players", () => {
    // TODO: encapsulate this list in an object
    const players = useStorage("players", <Player[]>[])

    const init = (p: string[]) => {
        players.value = p.map(x => ({
            id: uuidv4(),
            name: x,
        }))
    }

    const clear = () => players.value = []

    const getName = (id: string) => players.value.find(p => p.id === id)?.name ?? id

    return { players, init, getName, clear }
})
