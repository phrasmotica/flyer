import { ref } from "vue"
import { defineStore } from "pinia"

import type { Player } from "../models/Player"

export const usePlayersStore = defineStore("players", () => {
    const players = ref<Player[]>([])

    const setPlayers = (p: Player[]) => {
        players.value = p
    }

    const clear = () => setPlayers([])

    const getName = (id: string) => players.value.find(p => p.id === id)?.name ?? id

    return { players, setPlayers, getName, clear }
})
